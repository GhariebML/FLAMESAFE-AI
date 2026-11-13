# العضو B: البيانات وقاعدة البيانات والـ Ingestion

## إنت مسؤول عن إيه
إن البيانات العلمية الحقيقية من NASA تدخل النظام صح: جداول قاعدة البيانات، والـ migrations، وتحميل الأوراق البحثية واستخراج النص منها، وتوحيد الوحدات، وحفظ مصدر كل معلومة (DOI ورقم الصفحة).

## الفولدرات بتاعتك
| المسار | فيه إيه |
| :--- | :--- |
| `backend/app/models/` | جداول SQLAlchemy: `investigation`، `experimental_run`، `measurement`، `research_document`، `evidence_chunk`، `data_source` |
| `backend/migrations/` | Alembic migrations، وأولها `001_initial_schema.py` |
| `backend/app/repositories/` | استعلامات قاعدة البيانات (`document_repo.py`، `investigation_repo.py`) |
| `backend/app/ingestion/` | `sources/` (المصادر)، `extractors/` (PDF)، `parsers/`، `normalizers/` (الوحدات)، `validators/` |
| `backend/app/api/v1/endpoints/sources.py` | endpoint تفاصيل المصدر |
| `backend/scripts/` | `seed_data.py`، `run_migrations.py` |
| `data/` | `seed/` (البيانات الأساسية)، `samples/` (أمثلة) |

**ماتعدّلش في:** `backend/app/rag/` (ده بتاع C)، ولا الـ endpoints والـ services التانية (دي بتاعة الـ Lead). لو غيرت شكل جدول يستخدمه حد تاني، قوله قبلها.

## المهام (بالترتيب)

### B-1: Postgres شغال بالبيانات الأساسية
- شغّل Postgres (`docker compose up db` أو حسب `docs/LOCAL_DEVELOPMENT.md`)، وبعدها `python -m scripts.run_migrations` و`python -m scripts.seed_data`.
- تأكد إن الخمس تجارب (BASS, SAFFIRE, FLEX, SAME, ACME) اتحملوا، وإن الـ SQLite fallback (`USE_SQLITE_FALLBACK=true`) لسه شغال للاختبارات.
- **تمام لما:** الـ seed بيشتغل على قاعدة فاضية من غير أخطاء، ولو اتشغل مرتين مابيكررش البيانات.

### B-2: راجع البيانات العلمية في `data/seed/`
- كل رقم (الأكسجين، الضغط، سرعة الهواء) وكل DOI في `seed_investigations.json` و`seed_documents.json` لازم يكون ليه مصدر حقيقي تقدر ترجعله.
- أي قيمة مش متأكد منها تتشال وتبقى `null`. **ممنوع تخمّن أرقام.**
- **تمام لما:** كل سجل فيه مصدر (DOI أو رابط NTRS/PSI)، والـ DOIs بتفتح.

### B-3: Ingestion حقيقي من أول المستند لآخره
- دلوقتي `PSISourceAdapter.fetch_document_content` في `ingestion/sources/psi_adapter.py` **بيرجّع `None`**، يعني مفيش أي مستند بيتحمّل.
- نفّذ تحميل الـ PDFs العامة (من NTRS مثلًا) وخزّنها في `data/raw/` (متجاهلة في git)، وبعدها السلسلة دي:
  `pdf_extractor` ← `metadata_parser` ← `unit_normalizer` ← `scientific_validator` ← حفظ في `research_document` + `evidence_chunk`.
- كل chunk لازم يتخزن معاه **DOI ورقم الصفحة واسم القسم**، لأن C هيعتمد عليهم في الاقتباسات.
- اعمل سكريبت `backend/scripts/ingest.py` يشغّل السلسلة دي على مستند أو قائمة مستندات.
- **تمام لما:** تشغّل السكريبت على ورقة حقيقية واحدة على الأقل لكل تجربة، فتلاقي الـ chunks في قاعدة البيانات ومعاها مصدرها.

### B-4: pgvector (مع C)
- عمود `embedding` في `models/evidence_chunk.py` دلوقتي `JSON`، وده بطيء ومش بيستخدم pgvector.
- اعمل migration جديد (`002_...`) يحوّله لـ `vector(N)` على Postgres، و`N` = `EMBEDDING_DIMENSION` من الـ config. **اتفق مع C على الرقم الأول.**
- خلّي الـ SQLite fallback شغال بـ JSON عشان الاختبارات.
- **تمام لما:** الـ migration بيطلع وبينزل (`upgrade` / `downgrade`) على Postgres من غير ما بيانات تضيع.

### B-5: Repositories
- ضيف الاستعلامات اللي الـ Lead (التجارب والمقارنة) وC (البحث في الـ chunks) محتاجينها، بدل ما يكتبوا SQL جوه الـ services.

### B-6: اختبارات
- عندك دلوقتي `test_normalizer.py`. ضيف اختبارات للـ extractor والـ validator والـ parser، ولـ `seed_data` على SQLite.
- استخدم ملفات من `data/samples/` في الاختبارات، **من غير أي تحميل من الإنترنت جوه الاختبار**.

## قبل أي PR
```bash
cd backend
ruff check .
USE_SQLITE_FALLBACK=true AI_PROVIDER=mock EMBEDDING_PROVIDER=mock pytest -v
```
- الفرع: `feature/data-<اسم>`، والـ PR يروح على `integration`.
- لو ضفت مكتبة (زي `pgvector` أو مكتبة PDF) ضيفها في `requirements.txt` وقول ده في الـ PR.
- ماترفعش أي PDF على git (`*.pdf` متجاهل أصلًا، ماعدا `data/samples/`).

## مراجع
`docs/DATABASE_SCHEMA.md`، `docs/DATA_INGESTION.md`، `docs/DATA_DICTIONARY.md`، `docs/SCIENTIFIC_INTEGRITY.md`، `docs/decisions/ADR-002-database.md`
