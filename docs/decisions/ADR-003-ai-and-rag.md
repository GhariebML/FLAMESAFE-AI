# ADR-003: Provider-Agnostic AI Abstraction and Evidence-Grounded RAG

## Status
Accepted

## Date
2026-11-13

## Context
A major failure mode in scientific AI applications is hallucination: generating plausibly phrased but completely fictitious experimental numbers, synthetic citations, or non-existent DOI identifiers. Furthermore, hardcoding a specific commercial LLM provider (e.g. OpenAI or Anthropic) introduces vendor lock-in, API quota risk during live hackathon demos, and deployment hurdles.

## Decision
We implemented a **Provider-Agnostic AI & RAG Architecture**:
1. **Abstract Interfaces**: Defined `BaseLLMProvider` and `BaseEmbeddingProvider` allowing seamless swapping between Google Gemini, OpenAI, Anthropic, or an offline Mock provider.
2. **Deterministic Mock Mode**: Default configuration uses an offline deterministic generator and hash-based pseudo-embeddings, ensuring that the system is 100% testable and runnable without API credentials.
3. **Strict Citation Validation**: Every retrieved text chunk retains its document ID, DOI, page number, and section title. The answer generator is constrained by strict prompts to cite only retrieved chunks.
4. **Abstention Protocol**: If candidate chunks fall below the similarity threshold, the engine explicitly abstains rather than producing ungrounded assertions.

## Consequences
- **Positive**: Total immunity to broken demos during network or quota outages; completely transparent and traceable scientific citations; pluggable support for Google Gemini.
- **Negative**: Advanced LLM reasoning capabilities require configuring a valid API key (`GEMINI_API_KEY`).
