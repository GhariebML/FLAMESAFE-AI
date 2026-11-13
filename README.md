# FlameSafe AI
### *Turning Microgravity Combustion Research into Intelligent Fire Safety Insights.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pgvector-336791?style=flat&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![NASA Space Apps](https://img.shields.io/badge/Competition-NASA%20Space%20Apps%202026-blue)](https://www.spaceappschallenge.org/)
[![Team](https://img.shields.io/badge/Team-R%C2%B2%20(Cairo)-orange)](#-team-r)

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [نظرة عامة على المشروع (Arabic Overview)](#-نظرة-عامة-على-المشروع-arabic-overview)
3. [Problem Statement](#-problem-statement)
4. [The FlameSafe AI Solution](#-the-flamesafe-ai-solution)
5. [Target NASA Combustion Investigations](#-target-nasa-combustion-investigations)
6. [Core System Modules](#-core-system-modules)
7. [System Architecture](#-system-architecture)
8. [Technology Stack](#-technology-stack)
9. [Repository Directory Structure](#-repository-directory-structure)
10. [Quick Start Guide (PowerShell & Linux/macOS)](#-quick-start-guide)
11. [Environment Variables](#-environment-variables)
12. [API Contract & Available Endpoints](#-api-contract--available-endpoints)
13. [Database & Storage Architecture](#-database--storage-architecture)
14. [AI & RAG Intelligence Architecture](#-ai--rag-intelligence-architecture)
15. [Two-Developer Parallel Workflow](#-two-developer-parallel-workflow)
16. [دليل إعداد الفريق والمطورين (Arabic Team Onboarding)](#-دليل-إعداد-الفريق-والمطورين-arabic-team-onboarding)
17. [Scientific Integrity & Ethics](#-scientific-integrity--ethics)
18. [Testing & Quality Assurance](#-testing--quality-assurance)
19. [Roadmap & Future Milestones](#-roadmap--future-milestones)
20. [Team R²](#-team-r)
21. [Scientific References & Data Provenance](#-scientific-references--data-provenance)

---

## 🌌 Project Overview
**FlameSafe AI** is an AI-powered scientific research and spacecraft fire safety intelligence platform designed for the **2026 NASA Space Apps Challenge (Cairo)** in response to the official challenge:  
> **"Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data."**

The platform transforms complex, heterogeneous NASA microgravity combustion research into accessible, structured, searchable, comparable, and explainable scientific knowledge.

FlameSafe AI enables aerospace systems engineers, life support (ECLSS) architects, and combustion researchers to explore flight experiments, compare environmental conditions (oxygen fractions, pressure, ventilation airflow), identify knowledge gaps, and evaluate fire safety boundaries for future human space exploration missions—from low Earth orbit space stations to lunar bases and crewed Martian habitats.

---

## 🇪🇬 نظرة عامة على المشروع (Arabic Overview)

مشروع **FlameSafe AI** هو منصة ذكاء اصطناعي علمية متقدمة لأبحاث أمان الحرائق في الفضاء، تم تطويرها ضمن فعاليات **تحدي ناسا لتطبيقات الفضاء لعام 2026 (NASA Space Apps Challenge — Cairo)** من قِبل **فريق R²**.

### ما هي مشكلة أمان الحرائق في الفضاء؟
يُعد اشتعال الحرائق أحد أخطر التهديدات التي تواجه رواد الفضاء في الرحلات الاستكشافية. في بيئة الجاذبية الصغرى (Microgravity) داخل المركبات الفضائية ومحطة الفضاء الدولية (ISS)، تنعدم تيارات الحمل الحراري الطبيعية (Buoyancy) التي نألفها على الأرض، مما يؤدي إلى:
- استمرار اشتعال اللهب عند معدلات تهوية منخفضة للغاية.
- صعوبة رصد الدخان بالأساليب التقليدية بسبب تكتل جزيئات الدخان بشكل أكبر.
- عدم دقة اختبارات القابلية للاشتعال الأرضية التقليدية (NASA-STD-6001) عند تطبيقها على بيئات الفضاء ذات نسب الأكسجين العالية والضغط المنخفض.

### كيف يحل FlameSafe AI هذه المشكلة؟
يقوم النظام بفهرسة وتحليل البيانات التجريبية والأوراق البحثية المنشورة من أرشيف ناسا للعلوم الفيزيائية (**NASA PSI**) وأرشيف التقارير الفنية (**NTRS**)، ويتيح:
1. **استكشاف التجارب الفضائية التاريخية**: مثل BASS و SAFFIRE و FLEX و SAME و ACME.
2. **المقارنة العلمية الدقيقة**: مقارنة متغيرات الضغط، سرعة الهواء، ونسب الأكسجين مع الحفاظ على الوحدات الفيزيائية ومنع المقارنات المضللة.
3. **محاكاة السيناريوهات الاستكشافية**: تقييم بيئات المركبات الفضائية، والقواعد القمرية (جاذبية 0.166g)، والمستعمرات المريخية (جاذبية 0.38g).
4. **مساعد بحثي علمي مدعوم بـ RAG**: يجيب على الأسئلة البحثية بدقة تامة مع توثيق كل معلومة باقتباسات موثقة بأرقام الصفحات ومعرفات DOI الرسمية، مع الامتناع التام عن توليد استنتاجات غير مثبتة (Zero Hallucination).

---

## 🔍 Problem Statement
Decades of orbital combustion experiments aboard the Space Shuttle, the International Space Station (ISS), and Cygnus cargo resupply vehicles have produced priceless data on how solids, droplets, and gases ignite, spread, and extinguish in low-gravity environments.

However, extracting practical fire safety intelligence from this research is severely obstructed by:
- **Fragmented Repositories**: Data is scattered across NASA PSI databases, NASA Technical Reports Server (NTRS), and academic journals.
- **Unstructured Publications**: Key experimental parameters (sample geometry, quench airflows, limiting oxygen concentrations) are locked in PDFs and non-standard tables.
- **Microgravity vs Partial Gravity Gaps**: Microgravity ($0\text{g}$) data cannot be naively equated to Lunar surface gravity ($0.166\text{g}$) or Martian gravity ($0.38\text{g}$), where residual buoyancy alters flame stability and soot formation.
- **Exploration Atmosphere Differences**: Future exploration habitats plan to utilize hypoxic atmospheres (e.g., $28-34\%\text{ O}_2$ at $56.5\text{ kPa}$), which lack empirical testing in historical low-gravity datasets.

---

## 💡 The FlameSafe AI Solution
FlameSafe AI solves these challenges by combining:
1. **Source-Adapter Data Ingestion**: Automated collection, PyMuPDF extraction, and unit normalization from NASA archives.
2. **Relational & Vector Data Lake**: PostgreSQL 16 schema unified with `pgvector` for semantic document retrieval.
3. **Weighted Scientific Relevance Ranking**: Multi-factor scoring ($R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q$) explaining match rationales.
4. **Cross-Investigation Comparison Matrix**: Rigorous side-by-side parameter alignment preventing unit conflation and highlighting recorded deltas.
5. **Mission Scenario Analyzer**: Environmental mapping that contrasts spacecraft conditions with lunar and Martian exploration regimes, isolating verified evidence from unstudied research gaps.
6. **Evidence-Grounded SI Assistant**: RAG pipeline enforcing citation verification, DOI traceability, and an automated abstention protocol when empirical evidence is missing.

---

## 🚀 Target NASA Combustion Investigations
FlameSafe AI indexes five canonical NASA microgravity combustion flight programs:

| Acronym | Full Program Title | Facility & Platform | Primary Research Focus | Canonical Citation DOI |
| :--- | :--- | :--- | :--- | :--- |
| **BASS / BASS-II** | Burning and Suppression of Solids | Microgravity Science Glovebox (MSG) · ISS | Solid PMMA and fabric flammability limits, low-speed airflow quenching ($0.8\text{ cm/s}$), and gaseous suppressants ($N_2, CO_2$). | [10.1016/j.proci.2014.05.077](https://doi.org/10.1016/j.proci.2014.05.077) |
| **SAFFIRE I–III** | Spacecraft Fire Safety Experiment | Saffire Autonomous Flow Duct · Cygnus Vehicle | Vehicle-scale material burns (up to $0.4\text{ m} \times 1.0\text{ m}$), large-scale flame propagation, and post-fire particulate persistence. | [10.2514/1.A34167](https://doi.org/10.2514/1.A34167) |
| **FLEX / FLEX-2** | Flame Extinguishment Experiment | Multi-user Droplet Apparatus (MDCA) / CIR · ISS | Isolated spherical droplet burning (n-heptane, decane), radiative extinction, and discovery of low-temperature **cool flames**. | [10.1016/j.combustflame.2013.06.023](https://doi.org/10.1016/j.combustflame.2013.06.023) |
| **SAME / SAME-R**| Smoke Aerosol Measurement Experiment | Microgravity Science Glovebox (MSG) · ISS | Microgravity smoke aerosol particle agglomeration ($0.38\mu\text{m}$ vs $0.08\mu\text{m}$ in 1g) and early detection optimization. | [10.4271/2009-01-2481](https://doi.org/10.4271/2009-01-2481) |
| **ACME / CFI-G** | Advanced Combustion via Microgravity Experiments | Combustion Integrated Rack (CIR) · ISS | Laminar gaseous diffusion flames, electric field interactions, soot reduction, and burner extinction limits. | [10.1016/j.combustflame.2018.04.015](https://doi.org/10.1016/j.combustflame.2018.04.015) |

---

## ⚙️ Core System Modules

### Module 1 — Mission Intelligence Dashboard
- **Route**: `/dashboard` · **API**: `GET /api/v1/overview`
- Displays global scientific metrics: total indexed investigations, documented experimental runs, quantitative measurements, and research papers.
- Visualizes combustion domain distributions and recent NASA PSI data sources.

### Module 2 — Investigation Explorer
- **Route**: `/investigations` · **API**: `GET /api/v1/investigations`
- Multi-dimensional search filtering by acronym, fuel type, gravity regime, and scientific domain.
- Individual detail profiles (`/investigations/[id]`) rendering every experimental run, sample geometry, oxygen concentration, chamber pressure, and sensor suite.

### Module 3 — Investigation Comparison Workspace
- **Route**: `/compare` · **API**: `POST /api/v1/compare`
- Multi-investigation parameter alignment matrix.
- Direct numerical delta calculation for compatible physical units with explicit labeling of missing values.

### Module 4 — Scientific Relevance Ranking
- **Route**: `/insights` · **API**: `POST /api/v1/rank`
- Computes weighted research relevance:
  $$R = 0.30 D + 0.25 F + 0.20 C + 0.15 M + 0.10 Q$$
- Generates human-understandable explainability reports breaking down matched factors vs missing data.

### Module 5 — Mission Scenario Fire Safety Analyzer
- **Route**: `/scenarios` · **API**: `POST /api/v1/scenarios/analyze`
- Evaluates fire safety parameters across 6 exploration environments: Spacecraft, Space Station, Lunar Habitat, Lunar Rover, Mars Habitat, Mars Rover.
- Classifies condition matches (`Direct Match`, `Analogous Range`, `Extrapolated`) and isolates research gaps.

### Module 6 — SI Research Assistant
- **Route**: `/assistant` · **API**: `POST /api/v1/assistant/query`
- Evidence-grounded conversational research engine.
- Every claim is tied to verified NASA citations with active DOI hyperlinks, page numbers, and verbatim excerpts.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 15 / React / Tailwind)"]
        UI_Dash["Dashboard (Module 1)"]
        UI_Exp["Investigation Explorer (Module 2)"]
        UI_Comp["Comparison Matrix (Module 3)"]
        UI_Rank["Relevance Ranking (Module 4)"]
        UI_Scen["Scenario Analyzer (Module 5)"]
        UI_Asst["SI Assistant (Module 6)"]
        API_Client["Typed API Client (lib/api/client.ts)"]
    end

    subgraph Backend["FastAPI Modular Backend"]
        Router["API v1 Router (/api/v1)"]
        subgraph Services["Domain Services"]
            Svc_Inv["Investigation Service"]
            Svc_Comp["Comparison Service"]
            Svc_Rank["Ranking Engine"]
            Svc_Scen["Scenario Service"]
            Svc_AI["AI & RAG Service"]
        end
        subgraph Ingestion["Data Ingestion"]
            PSI_Adapter["NASA PSI Adapter"]
            PDF_Ext["PyMuPDF Extractor"]
            Unit_Norm["Unit Normalizer"]
            Sci_Val["Scientific Validator"]
        end
    end

    subgraph Storage["Storage Layer"]
        PG["PostgreSQL 16"]
        Vector["pgvector Extension"]
    end

    API_Client --> Router
    Router --> Services
    Services --> Storage
    Ingestion --> Storage
```

For comprehensive architectural design, see [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md).

---

## 💻 Technology Stack

| Layer | Technology | Version | Key Responsibility |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | 15.0.3 | Page routing, responsive layout, server/client rendering |
| **UI Library** | React | 19.0.0-rc | Reactive declarative component architecture |
| **Language** | TypeScript | 5.6.3 | Strict type contracts and interface guarantees |
| **Styling** | Tailwind CSS | 3.4.15 | Space exploration design system & responsive utility styles |
| **Data Visualization**| Recharts | 2.13.3 | Radar charts, domain distributions, parameter deltas |
| **Icons** | Lucide React | 0.460.0 | Clean, consistent aerospace & UI iconography |
| **Backend Framework** | FastAPI | 0.115.0+ | High-performance asynchronous REST API controllers |
| **ASGI Server** | Uvicorn | 0.32.0+ | Asynchronous event loop server |
| **Data Validation** | Pydantic v2 | 2.9.0+ | Strict schema validation and serialization |
| **Database ORM** | SQLAlchemy | 2.0.36+ | Asynchronous ORM models and repository queries |
| **Database Engine** | PostgreSQL | 16.0 | ACID relational storage with foreign key integrity |
| **Vector Search** | pgvector | 0.3.6+ | Vector similarity index for semantic RAG retrieval |
| **Database Migrations**| Alembic | 1.13.3+ | Database schema revision management |
| **Scientific Processing**| Pandas & NumPy | 2.2 / 1.26 | Data normalization and numerical calculations |
| **PDF Extraction** | PyMuPDF (fitz) | 1.24.11+ | High-fidelity scientific publication text extraction |
| **AI Abstraction** | Custom Provider Pattern | — | Pluggable interfaces for Gemini, OpenAI, and Mock |
| **Testing** | Pytest & Node Test | 8.3 / Node 20 | Automated unit, API, schema, and client tests |
| **Containerization** | Docker & Compose | 29.7+ | Multi-container local and production deployment |

---

## 📁 Repository Directory Structure

```text
flamesafe-ai/
├── README.md               # Master engineering documentation (English + Arabic)
├── LICENSE                 # MIT License (Team R²)
├── CONTRIBUTING.md          # Branch rules, PR guidelines, and code conventions
├── CHANGELOG.md             # Version history adhering to Keep a Changelog
├── Makefile                # Cross-platform development commands
├── docker-compose.yml       # PostgreSQL + pgvector, Backend, Frontend stack
├── .gitignore              # Standard ignore patterns
├── .env.example            # Environment configuration template
│
├── .github/
│   ├── workflows/ci.yml    # GitHub Actions automated lint and test CI
│   ├── ISSUE_TEMPLATE/     # Bug report and feature request templates
│   └── PULL_REQUEST_TEMPLATE.md
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml      # Python dependencies and pytest configuration
│   ├── requirements.txt    # Frozen pip dependencies
│   ├── alembic.ini         # Database migration configuration
│   ├── app/
│   │   ├── main.py         # FastAPI application entrypoint & error handlers
│   │   ├── api/v1/         # Endpoints for health, investigations, compare, etc.
│   │   ├── core/           # Config, database, exceptions, logging
│   │   ├── models/         # SQLAlchemy 2.0 declarative database models
│   │   ├── schemas/        # Pydantic v2 validation contracts
│   │   ├── repositories/   # Async repository database layer
│   │   ├── services/       # Core business logic & orchestration
│   │   ├── ingestion/      # Source adapters, PDF extractor, normalizers
│   │   ├── rag/            # Chunker, embeddings, retriever, citations
│   │   ├── ranking/        # Scoring formula and explainability
│   │   └── tests/          # Pytest automated test suite (16 passed tests)
│   ├── migrations/         # Alembic migrations (001_initial_schema, 002_add_embedding_metadata)
│   └── scripts/            # Database seed and PDF ingestion CLI scripts
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json        # Next.js, React, Tailwind, and Recharts dependencies
│   ├── tsconfig.json       # TypeScript configuration with strict mode
│   ├── next.config.ts      # Next.js server configuration
│   ├── tailwind.config.ts  # Aerospace design system tokens
│   ├── app/                # Next.js 15 App Router pages (/dashboard, /investigations, /compare, /insights, /scenarios, /assistant, /evidence)
│   ├── components/         # Layout, shared, and domain-specific components
│   ├── hooks/              # Custom React hooks (useInvestigations, useCompare, etc.)
│   ├── lib/api/            # Centralized API client and route constants
│   ├── lib/constants/      # Space environments, research domains, fallback data
│   ├── lib/utils/          # Formatters, units, styling helpers
│   ├── types/              # TypeScript interfaces mirroring API contracts
│   └── tests/              # Frontend unit tests
│
├── data/
│   ├── README.md           # Scientific data provenance and usage guide
│   ├── seed/               # Canonical NASA PSI investigations and publications
│   └── samples/            # Concrete request/response test payloads
│
├── scripts/
│   ├── setup.ps1           # Windows PowerShell automated setup
│   ├── setup.sh            # Linux / macOS automated setup
│   ├── run_dev.sh          # Concurrent development runner
│   └── validate_project.sh # End-to-end monorepo validation script
│
└── docs/                   # 25 comprehensive technical specifications, audits & roadmaps
    ├── diagrams/           # 6 version-controlled Mermaid diagrams (.mmd)
    └── decisions/          # 4 Architecture Decision Records (ADR-001 to ADR-004)
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Git**, **Python 3.11+**, and **Node.js 20+** installed on your workstation.
- Optional: **Docker & Docker Compose** for containerized database execution.

### Option A: Windows PowerShell Setup
```powershell
# 1. Clone repository
git clone https://github.com/GhariebML/FLAMESAFE-AI.git
cd FLAMESAFE-AI

# 2. Run automated setup
.\scripts\setup.ps1

# 3. Start Backend in Terminal 1
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Start Frontend in Terminal 2
cd frontend
npm run dev
```

### Option B: Linux / macOS Setup
```bash
# 1. Clone repository
git clone https://github.com/GhariebML/FLAMESAFE-AI.git
cd FLAMESAFE-AI

# 2. Run automated setup
chmod +x scripts/*.sh
./scripts/setup.sh

# 3. Start development stack
./scripts/run_dev.sh
```

### Option C: Docker Compose Full Stack
```bash
cp .env.example .env
docker compose up -d
```

### Accessing the Platform
- **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI ReDoc Reference**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Backend Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 🔑 Environment Variables
Copy `.env.example` to `.env` in the repository root:

```env
# System & Deployment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Frontend Configuration
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Database Configuration (PostgreSQL + pgvector)
POSTGRES_USER=flamesafe
POSTGRES_PASSWORD=flamesafe_dev_secret
POSTGRES_DB=flamesafe_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql+asyncpg://flamesafe:flamesafe_dev_secret@localhost:5432/flamesafe_db

# Local SQLite Fallback (Runs automatically without Docker)
USE_SQLITE_FALLBACK=true
SQLITE_DATABASE_URL=sqlite+aiosqlite:///./flamesafe_dev.db

# AI & Embedding Providers (mock | gemini | openai)
AI_PROVIDER=mock
AI_MODEL_NAME=gemini-1.5-pro
GEMINI_API_KEY=your_gemini_api_key_here
EMBEDDING_PROVIDER=mock
EMBEDDING_MODEL_NAME=text-embedding-004
```

---

## 📡 API Contract & Available Endpoints
All endpoints return standard envelope structures with explicit HTTP status codes:

| Method | Endpoint | Description | Primary Response Schema |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service and database connectivity status | `APIResponseEnvelope[Dict]` |
| `GET` | `/api/v1/overview` | Module 1 dashboard summary statistics | `APIResponseEnvelope[MissionOverviewResponse]` |
| `GET` | `/api/v1/investigations` | Module 2 listing with query & domain filters | `APIResponseEnvelope[PaginatedResponse]` |
| `GET` | `/api/v1/investigations/{id}` | Module 2 full profile with runs & measurements | `APIResponseEnvelope[InvestigationDetailSchema]`|
| `POST`| `/api/v1/compare` | Module 3 multi-investigation parameter matrix | `APIResponseEnvelope[ComparisonResponse]` |
| `POST`| `/api/v1/rank` | Module 4 weighted scientific relevance scoring | `APIResponseEnvelope[RankingResponse]` |
| `POST`| `/api/v1/scenarios/analyze` | Module 5 exploration regime safety evaluation | `APIResponseEnvelope[ScenarioAnalysisResponse]` |
| `POST`| `/api/v1/assistant/query` | Module 6 evidence-based RAG query with citations | `APIResponseEnvelope[AssistantQueryResponse]` |
| `GET` | `/api/v1/sources` | Complete provenance catalog of NASA sources, DOIs, and evidence chunks | `APIResponseEnvelope[SourceCatalogResponse]` |
| `GET` | `/api/v1/sources/{source_id}` | Provenance and external DOI audit details | `APIResponseEnvelope[DataSourceSchema]` |

For full request/response schemas, JSON examples, and error payloads, see [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

---

## 🗄️ Database & Storage Architecture
FlameSafe AI employs a relational schema in PostgreSQL 16:
- `investigations`: Canonical NASA flight research programs.
- `experimental_runs`: Discrete sample configurations, test geometries, and chamber settings.
- `measurements`: Quantitative sensor readings with explicit units (`cm/s`, `kW/m2`).
- `research_documents`: Peer-reviewed papers and NASA technical publications.
- `evidence_chunks`: Text segments and 768-dimensional embedding vectors for pgvector similarity search.
- `data_sources`: External provenance metadata and access timestamps.

For complete ERD diagrams and field definitions, see [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) and [docs/DATA_DICTIONARY.md](docs/DATA_DICTIONARY.md).

---

## 🧠 AI & RAG Intelligence Architecture
FlameSafe AI implements an extensible, provider-agnostic RAG pipeline designed to prevent hallucinations:
1. **Query Processing**: Normalizes inquiry terms and extracts target environmental keywords.
2. **Semantic Retrieval**: Retrieves candidate chunks using cosine similarity via `pgvector`.
3. **Scientific Reranking**: Boosts passages containing verified physical measurement units and section headers.
4. **Context Construction**: Formulates bounded prompt context incorporating only verified chunks.
5. **Grounded Generation**: Generates synthesis constrained strictly by the retrieved evidence.
6. **Citation Verification**: Binds claims to exact DOI links, page numbers, and publication excerpts.
7. **Abstention Protocol**: If evidence is missing or ambiguous, the engine explicitly abstains.

For comprehensive algorithmic details, see [docs/SI_ENGINE_AND_RAG.md](docs/SI_ENGINE_AND_RAG.md).

---

## 👥 Two-Developer Parallel Workflow

FlameSafe AI is built for parallel execution by two engineers:

```text
+------------------------------------+------------------------------------+
| Developer A (Frontend & Product)   | Developer B (Backend, Data & AI)   |
+------------------------------------+------------------------------------+
| Next.js 15 App Router & Pages      | FastAPI Architecture & Endpoints   |
| UI Components & Layout (Tailwind)  | Database Schema & Alembic Migrations|
| Data Visualizations (Recharts)     | NASA PSI Ingestion & PDF Parser    |
| Client Integration (lib/api/)      | Relevance Ranking Scoring Engine   |
| Frontend State & Custom Hooks      | RAG Pipeline & Citation Validator  |
| Frontend Unit Tests                | Pytest Automated Backend Tests     |
+------------------------------------+------------------------------------+
```

### Git Collaboration Rules
- **Branches**: Developer A branches `feature/frontend-*`, Developer B branches `feature/backend-*`.
- **Target**: All feature PRs merge into `integration` for staging verification.
- **Contract as Source of Truth**: Neither developer modifies API schemas without mutual agreement in [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

For full responsibilities, matrices, and milestones, see [docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md) and [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md).

---

## 🇪🇬 دليل إعداد الفريق والمطورين (Arabic Team Onboarding)

هذا الدليل مخصص لأعضاء فريق R² لتمكينهم من بدء العمل المباشر على المشروع:

### تقسيم المهام بين المطورين:
1. **المطور (أ) — مهندس الواجهات وتجربة المستخدم (Developer A)**:
   - مسؤول عن مجلد `frontend/`.
   - يقوم ببناء وتطوير صفحات Next.js 15 ومكونات Tailwind CSS ورسوم Recharts البيانية.
   - يتكامل مع الواجهة الخلفية عبر الملف المركزي `lib/api/client.ts`.
   - لا يقوم بتعديل نماذج قاعدة البيانات أو كود الباك إند بشكل مباشر.

2. **المطور (ب) — مهندس الواجهة الخلفية والذكاء الاصطناعي (Developer B)**:
   - مسؤول عن مجلد `backend/` ومجلد `data/`.
   - يقوم ببرمجة مسارات FastAPI، وتصميم جداول قاعدة البيانات عبر SQLAlchemy و Alembic.
   - يطور محرك تصنيف الأهمية ($R$) ومحرك البحث الدلالي (RAG) وتوثيق الاقتباسات (Citations).
   - يحافظ على توافق عقود API الموثقة في `docs/API_CONTRACT.md`.

### خطوات البدء السريع لأي مطور جديد:
1. تأكد من تثبيت Python 3.11 و Node.js 20 على جهازك.
2. قم بنسخ المستودع: `git clone https://github.com/GhariebML/FLAMESAFE-AI.git`.
3. شغل ملف الإعداد التلقائي المناسب لنظامك (`.\scripts\setup.ps1` لمستخدمي ويندوز أو `./scripts/setup.sh` لمستخدمي لينكس وماك).
4. تأكد من تشغيل الاختبارات بنجاح (`cd backend; python -m pytest -v`).
5. ابدأ بتنفيذ المهام المخصصة لك في ملف [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md).

---

## ⚖️ Scientific Integrity & Ethics
In spacecraft fire safety engineering, inaccurate assumptions can jeopardize astronaut lives. FlameSafe AI strictly enforces:
- **Verified Empirical Data vs AI Inference**: Explicit visual labeling of verified NASA sensor measurements vs AI-synthesized summaries.
- **Null Safety**: Unrecorded measurements remain `null`. Missing metrics are **NEVER** coerced to zero.
- **Relevance Score Disclaimer**: Relevance scores ($R$) represent research alignment and are **NOT** fire-risk probabilities or NASA safety clearances.
- **Microgravity vs Partial Gravity Distinction**: Microgravity ($0\text{g}$) data is never represented as directly predicting lunar ($0.166\text{g}$) or Martian ($0.38\text{g}$) surface behavior without explicit partial-gravity qualification.
- **Non-Endorsement Notice**: FlameSafe AI is an independent hackathon prototype and is not officially certified, endorsed by, or partnered with NASA.

For full guidelines, see [docs/SCIENTIFIC_INTEGRITY.md](docs/SCIENTIFIC_INTEGRITY.md).

---

## 🧪 Testing & Quality Assurance
The repository contains an automated test suite across backend and frontend layers:

### Run Backend Tests:
```bash
cd backend
python -m pytest -v
```
*Verified local test suite: 16 passed tests (covering APIs, ingestion validation, RAG evaluation, ranking, and scenarios in SQLite + mock AI mode).*

### Run Frontend Tests:
```bash
cd frontend
npm test
```
*Verified local frontend checks: 3 passed unit tests, `npx tsc --noEmit` (0 errors), and `npm run build` (11 static/dynamic routes).*

### Run CI Validation:
```bash
# Linux/macOS
./scripts/validate_project.sh
```

For testing procedures, see [docs/TESTING_AND_QA.md](docs/TESTING_AND_QA.md).

---

## 🗺️ Roadmap & Future Milestones
- **Phase 1 (Current)**: Monorepo foundation, canonical NASA PSI datasets, 6 functional modules, Docker stack, and CI automation.
- **Phase 2 (Q1 2027)**: Live web crawler for `psi.nasa.gov`, partial-gravity buoyancy scaling models, and synchronized video telemetry browser.
- **Phase 3 (Q3 2027)**: ECLSS emergency ventilation simulation coupling and automated spacecraft material flammability screening.

For full details, see [docs/MVP_ROADMAP.md](docs/MVP_ROADMAP.md).

---

## 👥 Team R²
*2026 NASA Space Apps Challenge — Cairo*

- **Mohamed Gharieb** — Lead Backend & AI Systems Architect
- **Toka Reda** — Lead Frontend & Product Engineer
- **Mai Hamdy** — Scientific Research & Data Engineer
- **Amany Atef** — UI/UX & Technical Documentation Specialist

---

## 📚 Scientific References & Data Provenance
Data and scientific parameters in FlameSafe AI are sourced from verified public archives:
1. **NASA Physical Sciences Informatics (PSI) Repository**:  
   [https://psi.nasa.gov/physci/repo](https://psi.nasa.gov/physci/repo)
2. **NASA Technical Reports Server (NTRS)**:  
   [https://ntrs.nasa.gov/](https://ntrs.nasa.gov/)
3. **NASA PSI Investigations by Research Area**:  
   [https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/](https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/)
4. **BASS Scientific Investigation**: Ferketi, P., et al. *Combustion Institute*, [DOI: 10.1016/j.proci.2014.05.077](https://doi.org/10.1016/j.proci.2014.05.077).
5. **SAFFIRE Flight Experiments**: Urban, D. L., et al. *Journal of Spacecraft and Rockets*, [DOI: 10.2514/1.A34167](https://doi.org/10.2514/1.A34167).
6. **FLEX Droplet & Cool Flame Research**: Williams, F. A., et al. *Combustion and Flame*, [DOI: 10.1016/j.combustflame.2013.06.023](https://doi.org/10.1016/j.combustflame.2013.06.023).
7. **SAME Smoke Aerosol Research**: Urban, D. L., et al. *SAE Technical Paper*, [DOI: 10.4271/2009-01-2481](https://doi.org/10.4271/2009-01-2481).
8. **ACME Gaseous Diffusion Flames**: Stocker, D. P., et al. *Combustion and Flame*, [DOI: 10.1016/j.combustflame.2018.04.015](https://doi.org/10.1016/j.combustflame.2018.04.015).
