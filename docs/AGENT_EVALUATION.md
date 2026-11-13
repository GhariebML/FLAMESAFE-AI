# FlameSafe AI — Multi-Agent Evaluation & Scientific Quality Metrics

## 1. Evaluation Framework

FlameSafe AI evaluates its 11-agent pipeline across four quantitative dimensions:

1. **Intent & Coverage Accuracy (Agents 02 & 03)**:
   - Domain, fuel, gravity regime, and campaign recall against benchmark combustion queries.
   - Local dataset reuse accuracy (`FULLY_AVAILABLE` vs. `PARTIALLY_AVAILABLE` vs. `REQUIRES_NEW_DATA`).
2. **File Selection Precision & Bandwidth Efficiency (Agent 05)**:
   - Verifies that the weighted scoring formula $F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A$ selects high-value experimental tables and peer-reviewed digests ($F \ge 65.0$) while excluding multi-hundred-megabyte raw video archives (`PSI-FILE-BASS-VIDEO-RAW`, 185 MB) for quantitative queries.
3. **Deterministic Scientific Data Quality (Agents 08 & 09)**:
   - **Provenance Coverage (%)**: Percentage of dataset records carrying a verified DOI and source file attribution.
   - **Strict Null Preservation**: $100\%$ compliance that missing values (`None`) are never converted to `0.0`.
   - **Physical Bound Enforcement**: $100\%$ rejection of out-of-range environmental parameters (e.g., $\text{O}_2 > 100\%$).
4. **RAG Citation Faithfulness & Abstention (Agent 11)**:
   - Grounded citation attachment (`doi`, `page_number`, `section_name`) and explicit abstention (`has_sufficient_evidence = False`) on out-of-domain prompts.
