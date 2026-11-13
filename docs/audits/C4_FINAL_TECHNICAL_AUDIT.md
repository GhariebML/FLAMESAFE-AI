# FlameSafe AI — Task C-4 Final Technical Audit & Scientific Review

**Document Version**: 1.0.0  
**Date**: November 13, 2026  
**Auditor**: Senior AI Engineer & Technical Lead (Role C)  
**Target Module**: Module 6 (SI Research Assistant — Citation Grounding, Evidence Validation, Abstention & Scientific Integrity)  
**Scope**: `backend/app/rag/citations.py`, `backend/app/services/ai_service.py`, `backend/app/schemas/assistant.py`, `backend/app/tests/test_citations.py`, `backend/app/tests/test_assistant.py`

---

## 1. Executive Summary

| Audit Item | Determination | Notes |
| :--- | :--- | :--- |
| **Audit Status** | **APPROVED WITH MINOR NOTES** | All verified defects were corrected and validated with regression tests. |
| **Citation Grounding** | **PASSED (Zero-Phantom Guarantee)** | Chunk-level provenance enforced; unretrieved or mismatched chunks cannot reach API response. |
| **Inline Citation Sanitization** | **PASSED** | LLM-generated hallucinated inline markers (e.g., `[CIT-999]`) are replaced with `[Unverified Reference Removed]`. |
| **Abstention Protocol** | **PASSED (Tri-State Architecture)** | Discretely handles Out-of-Domain, In-Domain with Insufficient Evidence, and In-Domain with Grounded Evidence. |
| **Partial-Gravity Advisory** | **PASSED** | Scientifically calibrated without overstating Grashof scaling; gated exclusively to in-domain fractional gravity queries. |
| **API Contract Compatibility** | **PASSED** | Fully backward-compatible schema; optional `chunk_id` field added without breaking existing clients. |
| **Test Suite Pass Rate** | **100% (57/57 Passed)** | 19 dedicated unit/integration tests for citations and assistant service. |
| **Code Style & Linting** | **100% Clean** | 0 Ruff errors across all Role C source and test files. |

---

## 2. Citation Grounding & Provenance Findings

### 2.1 Provenance Verification Architecture
The system establishes a strict unidirectional provenance pipeline:
$$\text{Database Chunks} \xrightarrow{\text{pgvector / In-Memory}} \text{Scored Candidates} \xrightarrow{\text{Reranker}} \text{Top-k Chunks} \xrightarrow{\text{Builder}} \text{Raw Citations} \xrightarrow{\text{Validator}} \text{Validated Citations}$$

1. **Allowlist Derivation**: Citations are generated exclusively from the actual retrieved and reranked `EvidenceChunk` objects. The LLM is never permitted to emit or construct arbitrary citation payloads.
2. **Primary Chunk ID Enforcement**: Each `CitationItem` now includes `chunk_id: str | None = None`. `CitationValidator.validate_citations_match_chunks()` checks if `cit.chunk_id in {c.id for c in retrieved_chunks}`:
   - If `cit.chunk_id` is specified and not in the retrieved chunk ID set, the citation is **immediately rejected**. It is not permitted to fall back to text matching.
   - If `cit.chunk_id` is omitted (legacy payloads), the validator requires an excerpt substring match against the actual retrieved chunk text.
3. **Deduplication**: Citations are deduplicated on `(citation_id, chunk_id)` to prevent redundant citation objects from populating the response envelope.
4. **Post-Validation Fail-Safe**: If all citations fail validation, the system withholds the response and returns `has_sufficient_evidence = False`.

### 2.2 Citation Classification Hierarchy
The authoritative 3-tier classification was audited and hardened:
- **Verified Source**: Requires a valid DOI (matching regex `^10\.\d{4,9}/[-._;()/:A-Za-z0-9]+$`), a valid PSI investigation identifier (`PSI-*` distinct from `"PSI-UNKNOWN"` and length > 4), and a specific document title.
- **Secondary Reference**: Traceable literature with a valid DOI, a valid PSI identifier, or a specific non-generic document URL (`source_url != "https://psi.nasa.gov/physci/repo"`).
- **Unverified**: Missing valid DOI, missing valid PSI identifier, and lacking a specific document URL.

---

## 3. Abstention & Domain Boundary Findings

### 3.1 Tri-State Abstention Logic
The system evaluates user inquiries against a tri-state decision matrix:

```mermaid
flowchart TD
    Q["User Query Received"] --> C["Fetch Candidates from DB"]
    C -->|No chunks in DB| A0["Abstain: No Corpus Available<br/>has_sufficient_evidence = False"]
    C -->|Chunks present| V["Vector Retrieval & Reranking"]
    V --> S{"Domain Terms Present?<br/>Score >= SIMILARITY_THRESHOLD (0.65)?"}
    S -->|No Domain Terms AND Score < 0.65| A1["State 1: Out-of-Domain Abstention<br/>has_sufficient_evidence = False<br/>No Citations | No Advisory"]
    S -->|In-Domain| E{"Top Reranked Score >= 0.30?"}
    E -->|No / Low Score| A2["State 2: In-Domain Insufficient Evidence<br/>has_sufficient_evidence = False<br/>No Citations"]
    E -->|Yes (Score >= 0.30)| G["State 3: Grounded Generation<br/>LLM Synthesis with Context Bounding"]
    G --> VAL["Citation Provenance Validation"]
    VAL --> SAN["Sanitize Inline References"]
    SAN --> PG{"Partial-Gravity Query?"}
    PG -->|Yes| W["Attach Planetary Gravity Advisory"]
    PG -->|No| R["Return Verified Response<br/>has_sufficient_evidence = True"]
    W --> R
```

### 3.2 Threshold Calibration and Score Normalization
- **Vector Retrieval**: Computes cosine similarity $\text{sim} \in [0.0, 1.0]$. A query term bonus (up to $+0.30$) is blended:
  $$\text{Score}_{\text{retrieval}} = \min\left(1.0, 0.70 \times \text{sim} + \min(0.30, \text{keyword\_bonus})\right)$$
- **Scientific Reranker**: Boosts quantitative measurement passages ($+0.08$ for units like `cm/s`, `kPa`, `mm`, `deg C`) and section matches ($+0.05$).
- **Calibration Thresholds**:
  - `settings.SIMILARITY_THRESHOLD = 0.65`: Used for out-of-domain detection. A query lacking combustion terms must score $\ge 0.65$ to avoid out-of-domain rejection.
  - `MIN_EVIDENCE_SCORE = 0.30`: Applied to in-domain queries. Chunks scoring below $0.30$ cannot satisfy evidence sufficiency.

---

## 4. Partial-Gravity Scientific Safeguard Review

### 4.1 Physical and Fluid Mechanical Grounding
The advisory was reviewed against NASA microgravity combustion physics:
- **orbital microgravity ($\sim 10^{-6}\text{ g}$)**: Natural buoyant convection is suppressed. Transport is dominated by molecular diffusion and forced airflow.
- **lunar ($0.166\text{ g}$) and Martian ($0.38\text{ g}$)**: Residual buoyancy creates buoyant flow velocities that scale with the Grashof number:
  $$\text{Gr} = \frac{g \beta (T_f - T_\infty) L^3}{\nu^2}$$
- **Scientific Caveat**: The advisory previously asserted that microgravity data could not predict partial gravity without Grashof number analysis. The audit corrected this overclaim: Grashof number scaling is an illustrative example of buoyancy scaling in convection-dominated regimes, but multi-phase pyrolysis, low-pressure quenching, and radiation-dominated regimes require broader physical modeling.

### 4.2 Query Gating & False Positive Protection
- A non-combustion query mentioning planetary bodies (e.g., *"What is the distance to the Moon?"*) is caught by State 1 (Out-of-Domain Abstention).
- Because State 1 returns before advisory evaluation, **no partial-gravity combustion warning is attached to non-combustion queries**.
- Advisory insertion logic verifies `partial_gravity_warning not in answer` before appending, preventing duplicate warning banners.

---

## 5. AI Pipeline & Response Integrity

### 5.1 End-to-End Pipeline Trace
1. **Candidate Retrieval**: Fetches database chunks scoped by optional investigation UUID filter.
2. **Retrieval Dispatch**: Executes PostgreSQL `pgvector` native cosine distance query `<=>`, falling back to vectorized in-memory cosine calculation on SQLite.
3. **Scientific Reranking**: Boosts experimental units and section relevance.
4. **Tri-State Abstention**: Rejects out-of-domain queries and in-domain queries with insufficient evidence before invoking the LLM.
5. **Context Bounding**: Context chunks passed to LLM include only retrieved text, acronym, title, and section. Prompt instructs model to answer strictly from context.
6. **LLM Generation**: Executes asynchronous REST request via `httpx.AsyncClient` with 30s timeout and domain exception handling (or deterministic `MockLLMProvider` offline).
7. **Citation Validation**: Validates all citations against retrieved chunk IDs.
8. **Inline Reference Sanitization**: Inspects generated text with `re.compile(r"\[CIT-(\d{1,4})\]")`. Unvalidated tags (e.g., `[CIT-999]`) are replaced with `[Unverified Reference Removed]`.
9. **Planetary Gravity Advisory**: Injects advisory into `scientific_uncertainty_note` and markdown `[!WARNING]` block if partial-gravity terms are detected.
10. **Response Assembly**: Emits `AssistantQueryResponse` envelope.

---

## 6. Test Suite Execution & Verification

### 6.1 Test Execution Log
```powershell
cd backend
python -m ruff check app/rag app/services/ai_service.py app/tests/test_citations.py app/tests/test_assistant.py
# Result: All checks passed!

python -m pytest -v app/tests
# Result: 57 passed in 1.89s
```

### 6.2 Test Breakdown
| Test Module | Tests | Status | Focus Areas |
| :--- | :---: | :---: | :--- |
| `app/tests/test_citations.py` | 13 | PASSED | Citation building, 3-tier classification, chunk ID provenance, deduplication, inline sanitization, partial-gravity detection, DOI validation. |
| `app/tests/test_assistant.py` | 6 | PASSED | End-to-end query, out-of-domain abstention, in-domain insufficient evidence, lunar non-combustion gating, partial-gravity advisory, backward-compatible schema. |
| `app/tests/test_retriever.py` | 7 | PASSED | Cosine similarity edge cases, in-memory threshold/sorting, pgvector mock, graceful fallback. |
| `app/tests/test_generator.py` | 12 | PASSED | Mock offline provider, Gemini HTTP auth, rate limits, timeouts, server errors, empty context abstention. |
| `app/tests/test_embeddings.py` | 10 | PASSED | Deterministic mock embeddings, batch document embedding, error handling, DB persistence. |
| Other Backend Tests | 9 | PASSED | Health checks, investigations API, unit normalizers, ranking service, scenario analysis. |
| **Total** | **57** | **100%** | **All tests passing offline.** |

---

## 7. Issues Identified & Resolved

| ID | Severity | Description | Resolution | Status |
| :--- | :--- | :--- | :--- | :--- |
| **H-1** | **High** | Fallback `source_url` (`https://psi.nasa.gov/physci/repo`) caused unverified records with a document title to be classified as "Secondary Reference". | Added explicit check `source_url != "https://psi.nasa.gov/physci/repo"` in `classify_source()`. | **FIXED** |
| **H-2** | **High** | In-domain queries with weak retrieval (top score < 0.30) bypassed out-of-domain checks and invoked LLM generation without sufficient evidence. | Implemented State 2 in `AIService` abstaining when `top_score < MIN_EVIDENCE_SCORE (0.30)`. | **FIXED** |
| **M-1** | **Medium** | LLM could generate hallucinated inline references (e.g., `[CIT-999]`) in answer text that were not present in the citation list. | Added `sanitize_answer_inline_citations()` replacing unverified inline citations with `[Unverified Reference Removed]`. | **FIXED** |
| **M-2** | **Medium** | Partial-gravity advisory overstated Grashof number analysis as an all-encompassing standalone solution. | Refined advisory text to present Grashof analysis as one regime-specific scaling method among multi-phase modeling approaches. | **FIXED** |
| **M-3** | **Medium** | Potential duplicate advisory injection if warning was already present in answer text. | Added idempotency check `if partial_gravity_warning not in sanitized_answer`. | **FIXED** |
| **L-1** | **Low** | `validate_citations_match_chunks()` allowed fuzzy text fallback even when an explicit `chunk_id` mismatched. | Mismatched `chunk_id` is now rejected immediately without falling back to text matching. | **FIXED** |
| **L-2** | **Low** | Potential duplicate citation items in response list. | Added `seen_keys` deduplication on `(citation_id, chunk_id)`. | **FIXED** |

---

## 8. Exact Files Modified

1. **`backend/app/rag/citations.py`**:
   - Added regex DOI validation `is_valid_doi()`.
   - Updated `classify_source()` with generic URL filtering.
   - Hardened `validate_citations_match_chunks()` with primary `chunk_id` validation and deduplication.
   - Added `sanitize_answer_inline_citations()`.
   - Expanded `PARTIAL_GRAVITY_KEYWORDS` and `COMBUSTION_DOMAIN_KEYWORDS`.
   - Calibrated `get_partial_gravity_warning()` text.
2. **`backend/app/services/ai_service.py`**:
   - Implemented tri-state abstention architecture.
   - Added post-generation citation validation check (withholds response if zero valid citations remain).
   - Added inline citation sanitization call.
   - Added advisory idempotency protection.
3. **`backend/app/schemas/assistant.py`**:
   - Added `chunk_id: str | None = None` to `CitationItem` schema for chunk-level provenance tracing.
4. **`backend/app/tests/test_citations.py`**:
   - Added 9 unit tests covering DOI validation, 3-tier classification, chunk ID mismatch, deduplication, empty chunks, inline sanitization, and keyword matching.
5. **`backend/app/tests/test_assistant.py`**:
   - Added 3 integration tests covering non-combustion planetary query gating, in-domain insufficient evidence abstention, and backward-compatible response schemas.

---

## 9. Remaining Limitations

1. **Natural Language Prose Hallucination**: While citation objects and inline markers `[CIT-xxx]` are 100% verified against retrieved chunks, an LLM generating unstructured prose could still theoretically extrapolate beyond context sentences if the provided excerpt is ambiguous.
2. **Keyword Blending in Standalone Retrieval**: In the SQLite in-memory retriever, the keyword boost formula ($0.7 \times \text{sim} + \min(0.3, \text{bonus})$) can elevate chunks with matching vocabulary. In production with PostgreSQL `pgvector`, native cosine distance provides pure semantic ranking.
3. **Offline Environment**: All tests execute deterministically offline using `AI_PROVIDER=mock` and `EMBEDDING_PROVIDER=mock`. Live testing with Google Gemini requires valid API credentials and internet access.

---

## 10. Final Recommendation

**Task C-4 is verified, scientifically sound, rigorously tested, and recommended for closure.**

The implementation satisfies all scientific integrity, citation grounding, zero-phantom citation, and partial-gravity advisory requirements defined in `team/C.md` and `docs/SCIENTIFIC_INTEGRITY.md`.

**Awaiting human authorization before proceeding to Task C-5.**
