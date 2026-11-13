# API Contract & Endpoint Specification — FlameSafe AI v1

## 1. Overview & Base URL
All API endpoints are versioned under the `/api/v1` prefix.

- **Base URL (Local)**: `http://localhost:8000/api/v1`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Technical Reference**: `http://localhost:8000/redoc`
- **OpenAPI Schema Specification**: `http://localhost:8000/api/v1/openapi.json`

---

## 2. Standard Response & Error Envelope

### Standard Success Envelope
All successful responses return HTTP `200 OK` (or `201 Created`) wrapped in `APIResponseEnvelope<T>`:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-11-13T12:00:00Z"
}
```

### Standard Error Envelope
All error responses return standard HTTP error codes (`400`, `404`, `422`, `500`) with `APIErrorResponse`:

```json
{
  "success": false,
  "error": {
    "code": "INVESTIGATION_NOT_FOUND",
    "message": "Investigation with identifier 'invalid-id' not found.",
    "details": {
      "investigation_id": "invalid-id"
    }
  },
  "timestamp": "2026-11-13T12:00:00Z"
}
```

---

## 3. Endpoints Specification

### 3.1. Health Check
- **Route**: `GET /api/v1/health`
- **Description**: Verifies service status, active database connectivity, and configured AI providers.
- **Response**:
```json
{
  "success": true,
  "message": "FlameSafe AI backend service is healthy",
  "data": {
    "status": "healthy",
    "app_name": "FlameSafe AI",
    "version": "0.1.0",
    "environment": "development",
    "database_status": "connected",
    "ai_provider": "mock",
    "embedding_provider": "mock"
  },
  "timestamp": "2026-11-13T12:00:00Z"
}
```

---

### 3.2. Mission Intelligence Overview
- **Route**: `GET /api/v1/overview`
- **Description**: Module 1 dashboard summary metrics, research domains, fuel distributions, and recent provenance sources.
- **Response**:
```json
{
  "success": true,
  "message": "Mission overview metrics retrieved successfully",
  "data": {
    "total_investigations": 5,
    "total_experimental_runs": 8,
    "total_measurements": 14,
    "total_documents": 5,
    "research_domains": [
      {
        "domain": "Solid Fuel Flammability & Suppression",
        "investigations_count": 1,
        "runs_count": 2
      }
    ],
    "fuel_categories": [
      { "fuel_category": "Solid Polymer", "count": 3 }
    ],
    "investigation_groups": ["BASS", "SAFFIRE", "FLEX", "SAME", "ACME"],
    "recent_sources": [
      {
        "id": "src-001",
        "source_name": "NASA Physical Sciences Informatics (PSI)",
        "investigation_acronym": "BASS",
        "doi": "10.1016/j.proci.2014.05.077",
        "accessed_at": "2026-10-15T10:00:00Z"
      }
    ],
    "coverage_summary": {
      "microgravity_regimes": "ISS (MSG, CIR) & Cygnus Resupply Flight Module"
    }
  },
  "timestamp": "2026-11-13T12:00:00Z"
}
```

---

### 3.3. List Investigations
- **Route**: `GET /api/v1/investigations`
- **Query Parameters**:
  - `query` (string, optional): Search keyword across title, acronym, PSI ID, objectives, or description.
  - `research_area` (string, optional): Filter by domain.
  - `fuel_type` (string, optional): Filter by fuel category or name.
  - `gravity_regime` (string, optional): Filter by gravity regime.
  - `acronym` (string, optional): Filter by acronym.
  - `sort_by` (string, optional): Sort by `acronym` or `title`.
  - `page` (int, default `1`): Page number.
  - `page_size` (int, default `10`, max `100`): Items per page.
- **Response**:
```json
{
  "success": true,
  "message": "Retrieved 5 investigations",
  "data": {
    "items": [
      {
        "id": "e0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c",
        "psi_id": "PSI-BASS-01",
        "acronym": "BASS",
        "title": "Burning and Suppression of Solids",
        "research_area": "Solid Fuel Flammability & Suppression",
        "description": "Examines burning and extinction characteristics...",
        "doi": "10.1016/j.proci.2014.05.077",
        "source_url": "https://psi.nasa.gov/physci/repo",
        "experimental_runs_count": 2,
        "documents_count": 1
      }
    ],
    "total": 5,
    "page": 1,
    "page_size": 10,
    "total_pages": 1
  },
  "timestamp": "2026-11-13T12:00:00Z"
}
```

---

### 3.4. Get Investigation Detail
- **Route**: `GET /api/v1/investigations/{investigation_id}`
- **Path Parameters**: `investigation_id` (UUID or PSI ID).
- **Response**: Full profile with `experimental_runs`, `measurements`, `research_documents`, and `data_sources`.

---

### 3.5. Compare Investigations
- **Route**: `POST /api/v1/compare`
- **Request Body**:
```json
{
  "investigation_ids": [
    "e0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c",
    "f1b2c3d4-e5f6-4a7b-8c9d-1e2f3a4b5c6d"
  ],
  "target_parameters": ["oxygen_concentration", "pressure_value", "airflow_velocity"]
}
```
- **Response**: Profile matrix, parameter alignment, scientific summary, and limitations list.

---

### 3.6. Scientific Relevance Ranking
- **Route**: `POST /api/v1/rank`
- **Request Body**:
```json
{
  "query": "solid polymer flammability limits under low ventilation in microgravity",
  "target_environment": "Spacecraft",
  "fuel_category": "Solid Polymer",
  "weights": {
    "domain_relevance": 0.30,
    "fuel_compatibility": 0.25,
    "condition_compatibility": 0.20,
    "mission_applicability": 0.15,
    "metadata_quality": 0.10
  }
}
```
- **Response**: Ranked items with factor breakdown (0-100), matched factors, missing factors, and disclaimer.

---

### 3.7. Mission Scenario Analysis
- **Route**: `POST /api/v1/scenarios/analyze`
- **Request Body**:
```json
{
  "environment": "Lunar Habitat",
  "fuel_type": "Solid Polymer",
  "oxygen_concentration": 28.0,
  "pressure_value": 56.5,
  "pressure_unit": "kPa",
  "airflow_velocity": 5.0,
  "airflow_unit": "cm/s",
  "fire_safety_focus": "Flammability"
}
```
- **Response**: Target gravity context, condition match statuses (`Direct Match`, `Analogous Range`, `Extrapolated`), research gaps, and safety advisory.

---

### 3.8. SI Assistant Query
- **Route**: `POST /api/v1/assistant/query`
- **Request Body**:
```json
{
  "query": "What are the observed airflow extinction limits in BASS?",
  "investigation_id_filter": "e0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c",
  "max_citations": 3
}
```
- **Response**: Grounded scientific answer, verified citations list (with DOI, page, excerpt), and uncertainty note.

---

### 3.9. List Sources & Evidence Catalog
- **Route**: `GET /api/v1/sources`
- **Query Parameters**:
  - `investigation` (string, optional): Filter by investigation acronym or UUID.
  - `query` (string, optional): Search across evidence text, document title, section name, or DOI.
- **Response**: Returns `total_sources`, `total_documents`, `total_evidence_chunks`, `sources[]`, and `evidence_items[]` with verification status and embedding provider provenance.

### 3.10. Get Source Provenance
- **Route**: `GET /api/v1/sources/{source_id}`
- **Path Parameters**: `source_id` (UUID).
- **Response**: Provenance archive name, DOI, version, and access timestamp.


---

## 9. Multi-Agent Research Intelligence Endpoints (`/api/v1/research`)

### `POST /api/v1/research/requests`
- **Request Body**: `{ "question": "string", "require_approval": false, "force_psi_discovery": true }`
- **Response (`201 Created`)**: `APIResponseEnvelope[ResearchRequestDetailResponse]` containing thread ID, status (`READY` or `AWAITING_APPROVAL`), parsed `research_intent`, `existing_data_coverage`, `discovered_investigations`, `candidate_files`, `selected_files`, `dataset_id`, `final_answer`, `final_report`, `agent_runs`, and `workflow_events`.

### `GET /api/v1/research/requests`
- **Response (`200 OK`)**: `APIResponseEnvelope[list[ResearchRequestDetailResponse]]`

### `GET /api/v1/research/requests/{request_id}`
- **Response (`200 OK`)**: `APIResponseEnvelope[ResearchRequestDetailResponse]`

### `GET /api/v1/research/requests/{request_id}/events`
- **Response (`200 OK`)**: `APIResponseEnvelope[list[WorkflowEventSchema]]`

### `POST /api/v1/research/requests/{request_id}/approve`
- **Request Body**: `{ "decision": "APPROVE | REJECT | MODIFY_PLAN | RESUME_WORKFLOW", "selected_file_identifiers": ["..."], "decided_by": "string", "reason": "string" }`
- **Response (`200 OK`)**: `APIResponseEnvelope[ResearchRequestDetailResponse]`

### `POST /api/v1/research/requests/{request_id}/revise`
- **Request Body**: `{ "updated_question": "string", "fuel_type": "string", "gravity_regime": "string", "variables_of_interest": ["..."], "require_approval": false }`
- **Response (`200 OK`)**: `APIResponseEnvelope[ResearchRequestDetailResponse]`

### `POST /api/v1/research/requests/{request_id}/resume`
- **Response (`200 OK`)**: `APIResponseEnvelope[ResearchRequestDetailResponse]`

---

## 10. NASA PSI Connector & Acquisition Endpoints (`/api/v1/psi` & `/api/v1/acquisitions`)

- `GET /api/v1/psi/investigations/search?query=...&fuel_type=...&research_domain=...`
- `GET /api/v1/psi/investigations/{investigation_id}`
- `GET /api/v1/psi/investigations/{investigation_id}/files?question=...`
- `GET /api/v1/psi/files/{file_id}`
- `POST /api/v1/acquisitions` (`{ "request_id": "...", "file_identifiers": ["PSI-FILE-BASS-TABLE-01"] }`)
- `GET /api/v1/acquisitions/{acquisition_id}`

---

## 11. Dynamic Dataset Engine Endpoints (`/api/v1/datasets`)

- `GET /api/v1/datasets`
- `GET /api/v1/datasets/{dataset_id}`
- `GET /api/v1/datasets/{dataset_id}/versions`
- `GET /api/v1/datasets/{dataset_id}/quality-report`
- `POST /api/v1/datasets/{dataset_id}/analyze`
- `GET /api/v1/datasets/{dataset_id}/export?format=json|csv|parquet`
