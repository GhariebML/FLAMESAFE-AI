# FlameSafe AI — NASA Physical Sciences Informatics (PSI) Integration

## 1. Grounded NASA PSI Integration Strategy

FlameSafe AI integrates with NASA Physical Sciences Informatics (`https://psi.nasa.gov`) through a dedicated connector package (`backend/app/connectors/psi/`) designed around **scientific honesty and security**:

1. **No Fabricated Live Endpoints**: Because NASA PSI does not expose an unauthenticated bulk-file download REST API for multi-gigabyte optical archives, FlameSafe AI never fakes external live scrapes.
2. **11 Verified Microgravity Combustion Campaigns**:
   - **Locally Verified & Seeded (Direct Acquisition)**: `BASS` (`PSI-BASS-01`), `SAFFIRE` (`PSI-SAFFIRE-01`), `FLEX` (`PSI-FLEX-01`), `SAME` (`PSI-SAME-01`), `ACME` (`PSI-ACME-01`).
   - **Catalog Metadata Verified (User-Assisted Portal Handoff)**: `BASS-II` (`PSI-BASS-II-01`), `FLEX-2` (`PSI-FLEX-2-01`), `SAME-R` (`PSI-SAME-R-01`), `CFI-G` (`PSI-CFI-G-01`), `SOFIE` (`PSI-SOFIE-01`), `BRE` (`PSI-BRE-01`).

---

## 2. Smart File Priority Scoring Formula (Agent 05)

Candidate files in `PSIFileManifestService` are scored on a $0\text{--}100$ scale using:

$$F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A$$

Where:
- $Q$ (**Question & Fuel Relevance**, weight $0.35$): Alignment with the user's research question, fuel material, and target campaign.
- $T$ (**File Type Relevance**, weight $0.25$): Prioritizes `Experimental Tables` and `Analyzed Data` ($96$), followed by `Scientific Publications` ($90$), `Metadata` ($72$), and penalizes raw `Video`/`Images` ($18$) unless optical analysis is requested.
- $C$ (**Content Variable Coverage**, weight $0.20$): Overlap between the file's `content_coverage` tags and `variables_of_interest`.
- $P$ (**Provenance Quality**, weight $0.10$): Presence of a verified peer-reviewed DOI ($95$ vs $65$).
- $A$ (**Availability & Accessibility**, weight $0.10$): `DIRECT_VERIFIED_SEED` ($100$), `DIRECT_PUBLIC_URL` ($85$), or `USER_ASSISTED_PSI_PORTAL` ($40$).
