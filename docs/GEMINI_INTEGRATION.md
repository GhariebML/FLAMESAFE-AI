# FlameSafe AI — Google Gemini API Integration & Production AI Guide

## 1. Architecture Overview

FlameSafe AI integrates Google's official GenAI SDK (`google-genai`) through a provider-abstracted architecture across both the **RAG Evidence Engine** and the **11-Agent LangGraph Scientific Data Intelligence System**:

- **LLM Provider Abstraction (`backend/app/rag/generator.py`)**:
  - `BaseLLMProvider`: Unified interface for `generate_response()` and `generate_structured()`.
  - `GeminiLLMProvider`: Production async provider powered by `google.genai.Client` (`client.aio.models.generate_content`), supporting Pydantic-validated structured JSON outputs, token usage telemetry (`usage_metadata`), secret sanitization, and bounded exponential backoff with jitter.
  - `MockLLMProvider`: Deterministic, offline evidence-grounded synthesizer used for offline CI testing or explicit fallback (`is_mock = True`).
- **Embedding Provider Abstraction (`backend/app/rag/embeddings.py`)**:
  - `BaseEmbeddingProvider`: Unified interface for `embed_query()` and `embed_documents()`.
  - `GeminiEmbeddingProvider`: Production async embedding provider (`client.aio.models.embed_content`) with explicit output dimensionality configuration (`768` dimensions), bilingual English/Arabic UTF-8 support, strict vector length validation, and bounded retry logic.
  - `MockEmbeddingProvider`: Deterministic SHA-256 trigonometric vector generator (`is_mock = True`), strictly isolated from Gemini semantic vectors by `EvidenceRetriever.is_chunk_vector_compatible()`.
- **Runtime Diagnostics (`backend/app/api/v1/endpoints/ai_status.py`)**:
  - `GET /api/v1/ai/status`: Performs a safe backend-side connectivity check (`verify_gemini_connectivity`) and reports `provider`, `configured`, `connected`, `generation_model`, `embedding_model`, `embedding_dimensions`, `is_mock_provider`, `last_successful_request_at`, and sanitized `last_error`.

---

## 2. Required Environment Variables

Configure these variables in the git-ignored `backend/.env` file (template provided in `.env.example`):

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | *(empty)* | Your Google AI Studio / Gemini API key. **Never commit this key to Git.** |
| `AI_PROVIDER` | `gemini` | Active LLM provider (`gemini` or `mock`). |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Primary Gemini generation model identifier. |
| `GEMINI_EMBEDDING_MODEL` | `gemini-embedding-2` | Primary Gemini embedding model identifier. |
| `GEMINI_EMBEDDING_DIMENSIONS` | `768` | Output vector dimensionality enforced across embeddings and database chunks. |
| `GEMINI_TIMEOUT_SECONDS` | `60` | Per-request timeout in seconds for Gemini generation and embedding calls. |
| `GEMINI_MAX_RETRIES` | `3` | Maximum bounded retries for transient errors (HTTP 429, 5xx, timeouts). |
| `GEMINI_TEMPERATURE` | `0.2` | Default sampling temperature for scientific grounding. |
| `AI_FALLBACK_TO_MOCK` | `true` | If `true`, falls back to `MockLLMProvider` (`is_mock_provider=true`) when Gemini is unreachable rather than crashing user workflows. |

---

## 3. Obtaining & Configuring a Gemini API Key

1. Sign in to [Google AI Studio](https://aistudio.google.com/apikey) and generate a Gemini API key.
2. Copy `.env.example` to `backend/.env`:
   ```bash
   cp .env.example backend/.env
   ```
3. Set `GEMINI_API_KEY` inside `backend/.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   AI_PROVIDER=gemini
   GEMINI_MODEL=gemini-3.8-flash
   GEMINI_EMBEDDING_MODEL=gemini-embedding-2
   GEMINI_EMBEDDING_DIMENSIONS=768
   ```
4. **Security Rules**:
   - `backend/.env` and `.env` are git-ignored.
   - Never expose `GEMINI_API_KEY` as `NEXT_PUBLIC_*` in the Next.js frontend.
   - All exception messages and logs pass through `sanitize_secret()` which redacts the API key as `[REDACTED_API_KEY]`.

---

## 4. Embedding Dimension & Backfill Workflow

Every `EvidenceChunk` row in the database stores complete vector provenance:
- `embedding`: `768`-dimensional float vector
- `embedding_provider`: `"gemini"` or `"mock"`
- `embedding_model`: e.g. `"gemini-embedding-2"`
- `embedding_dimension`: `768`
- `embedded_at`: UTC timestamp
- `content_hash`: SHA-256 hash of `chunk_text`

### Running the Resumable Embedding Backfill CLI
To re-embed existing chunks that currently have missing or `"mock"` embeddings in batches:

```bash
cd backend
python -m scripts.backfill_embeddings --batch-size 10
```

Options:
- `--batch-size 10`: Number of chunks embedded per API request batch.
- `--limit 50`: Optional cap on the number of chunks processed in a single run.
- `--strict-live`: Fails immediately if a live Gemini connection is not available.

Because each batch commits immediately and verifies `embedding_provider`, `embedding_model`, `embedding_dimension`, and `content_hash`, interrupted runs can be resumed safely without re-embedding already updated chunks.

---

## 5. Switching Between Gemini and Mock Mode

- **Production Gemini Mode**:
  ```env
  AI_PROVIDER=gemini
  EMBEDDING_PROVIDER=gemini
  GEMINI_API_KEY=<valid_key>
  ```
- **Offline / Deterministic Mock Mode (CI & Local Demo without API Credits)**:
  ```env
  AI_PROVIDER=mock
  EMBEDDING_PROVIDER=mock
  ```

---

## 6. Running Unit Tests & Opt-In Live Smoke Tests

### Deterministic Unit, RAG, and Multi-Agent Tests (Offline-Safe)
```bash
cd backend
python -m pytest -v
```

### Opt-In Live Gemini Smoke Tests
Live tests against Google's production endpoint are skipped by default in CI and enabled via `RUN_LIVE_GEMINI_TESTS=1`:
```bash
cd backend
RUN_LIVE_GEMINI_TESTS=1 python -m pytest app/tests/test_gemini_integration.py -k test_live_gemini_smoke_suite -v
```

### Frontend AI Status Component Tests
```bash
cd frontend
npx tsc --noEmit
npm test -- --run
```

---

## 7. Error Categories & Troubleshooting

All Gemini errors are normalized into `GeminiProviderError` with structured `error_category` values:

| Error Category | HTTP Status | Retryable | Cause & Resolution |
| :--- | :--- | :--- | :--- |
| `MISSING_API_KEY` | `401` | No | `GEMINI_API_KEY` is blank in `backend/.env`. |
| `AUTHENTICATION_ERROR` | `400` / `401` / `403` | No | The provided API key is invalid, expired, or not authorized for the Generative Language API. Verify the key in Google AI Studio. |
| `MODEL_NOT_FOUND_ERROR` | `404` | No | The configured `GEMINI_MODEL` or `GEMINI_EMBEDDING_MODEL` identifier is not available on the target API version/account. |
| `RATE_LIMIT_ERROR` | `429` | Yes (Exponential Backoff) | Quota or RPM limit reached; automatically retried up to `GEMINI_MAX_RETRIES`. |
| `SERVER_ERROR` | `500`–`504` | Yes (Exponential Backoff) | Transient Google server error; retried automatically with jitter. |
| `TIMEOUT_ERROR` | `504` | Yes (Exponential Backoff) | Request exceeded `GEMINI_TIMEOUT_SECONDS`. |
| `SAFETY_BLOCKED_ERROR` | `422` | No | Prompt or candidate blocked by safety filters. |
| `MALFORMED_STRUCTURED_OUTPUT_ERROR` | `422` | No | Output JSON failed Pydantic validation against the target schema. |
| `INVALID_EMBEDDING_DIMENSION_ERROR` | `422` | No | Returned vector length did not match `GEMINI_EMBEDDING_DIMENSIONS` (`768`). |
