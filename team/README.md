# تقسيم الشغل على الفريق (4 أشخاص)

المشروع اتقسم لأربع أجزاء، كل جزء ليه صاحب واحد مسؤول عنه. القاعدة الأساسية:
**كل واحد يعدّل في الفولدرات بتاعته بس.** لو محتاج تغيير في جزء حد تاني، اطلبه منه أو افتح Issue.

| العضو | الجزء | الفولدرات الأساسية | الملف |
| :--- | :--- | :--- | :--- |
| **Lead** (صاحب الريبو) | الـ API الأساسي + التكامل + CI/Docker + المراجعة والـ merge | `backend/app/core/`، `backend/app/api/`، `backend/app/services/` (ماعدا AI/ranking)، `docs/API_CONTRACT.md`، `.github/`، `docker-compose.yml` | الملف ده (تحت) |
| **A** | الواجهة الأمامية (Frontend) | `frontend/` كله | [A.md](A.md) |
| **B** | البيانات وقاعدة البيانات والـ Ingestion | `backend/app/models/`، `backend/migrations/`، `backend/app/repositories/`، `backend/app/ingestion/`، `data/`، `backend/scripts/` | [B.md](B.md) |
| **C** | الذكاء الاصطناعي: RAG والمساعد والترتيب (Ranking) | `backend/app/rag/`، `backend/app/ranking/`، `backend/app/services/ai_service.py`، `backend/app/services/ranking_service.py` | [C.md](C.md) |

---

## الحالة الحالية للمشروع (يوم 2026-11-13)

- الكود كله على `main` في GitHub.
- اختبارات الباك إند: **11 اختبار ناجحين** (`pytest`).
- الفرونت إند: **`tsc --noEmit` ناجح**. لسه ماحدش جرّب `npm run build`.
- **حاجات لسه وهمية (mock) ولازم تتعمل بجد:**
  - الـ LLM والـ Embeddings: `AI_PROVIDER=mock`، و`GeminiLLMProvider` لسه بيرجّع إجابة وهمية (ده شغل **C**).
  - الـ Ingestion: `fetch_document_content` مابينزّلش أي مستند حقيقي لسه (ده شغل **B**).
  - الـ Embeddings متخزنة كـ JSON مش pgvector (ده شغل **B** و**C** مع بعض).
  - الفرونت إند بيعرض بيانات وهمية من غير ما يقول للمستخدم لو الباك إند واقع (ده شغل **A**).

---

## جزء الـ Lead (أنا)

**المسؤوليات:**
1. **قبل ما الفريق يبدأ:**
   - حدّث فرع `integration` على GitHub. هو دلوقتي واقف على commit قديم (`0fa68f6`):
     `git push origin main:integration`
   - ضيف A و B و C كـ Collaborators على الريبو.
   - فعّل Branch protection على `main`: مفيش push مباشر، ولازم PR يعدّي الـ CI.
2. **الـ API والخدمات الأساسية:**
   - `backend/app/api/v1/endpoints/`: الـ endpoints دي: `investigations`، `comparison`، `scenarios`، `overview`، `health`.
   - `backend/app/services/`: `investigation_service.py`، `comparison_service.py`، `scenario_service.py`.
   - `backend/app/schemas/` (ماعدا `assistant.py` و`ranking.py` بتوع C).
   - `backend/app/core/`: config وdatabase وlogging وexceptions.
3. **عقد الـ API (`docs/API_CONTRACT.md`):** أي تغيير في شكل request أو response لازم يتكتب هنا الأول، وA والشخص صاحب الـ endpoint يوافقوا قبل ما حد يكتب كود.
4. **CI و Docker:**
   - ضيف `npm run build` و`npm run lint` للـ CI. دلوقتي الـ CI بيعمل typecheck بس.
   - تأكد إن `docker compose up` بيشغّل الـ Postgres والباك إند والفرونت مع بعض.
5. **المراجعة:** تراجع كل PR داخل على `integration`، ومرة كل أسبوع (أو قبل كل ديمو) تعمل merge من `integration` لـ `main`.

**الاختبارات بتاعتك:** `test_health.py`، `test_investigations.py`، `test_comparison.py`، `test_scenarios.py`، `conftest.py`.

---

## قواعد الشغل للكل

### الفروع (Branches)
```text
main            ← نسخة مستقرة، الـ Lead بس اللي يعمل merge عليها
integration     ← كل الـ PRs بتدخل هنا
  feature/fe-<اسم>     ← A
  feature/data-<اسم>   ← B
  feature/ai-<اسم>     ← C
  feature/api-<اسم>    ← Lead
```

### خطوات أي مهمة
1. `git checkout integration && git pull`
2. `git checkout -b feature/<prefix>-<اسم-المهمة>`
3. اشتغل وشغّل الاختبارات بتاعتك محليًا.
4. `git push origin feature/...` وافتح PR على **`integration`** (مش `main`).
5. الـ Lead يراجع، وبعدين Squash and Merge.

### Commits
بصيغة Conventional Commits:
`feat(frontend): ...`، `feat(ingestion): ...`، `feat(rag): ...`، `fix(api): ...`، `test(...)`، `docs: ...`

### ملفات مشتركة (أكتر أماكن هيحصل فيها conflict)
الملفات دي ممكن أكتر من واحد يحتاجها. **عدّل فيها أقل حاجة ممكنة، وقول في الـ PR إنك لمستها:**
- `backend/requirements.txt`، `frontend/package.json`
- `.env.example`: ضيف المتغير الجديد بقيمة وهمية بس، **عمرك ما تحط مفتاح حقيقي**.
- `backend/app/models/__init__.py`، `backend/app/api/v1/router.py`
- `docs/API_CONTRACT.md`: الـ Lead لازم يوافق.

### الأمان
- ملف `.env` عمره ما يترفع. المفاتيح (API keys) تتحط في `.env` محلي بس.
- الـ CI بيشتغل دايمًا بـ `AI_PROVIDER=mock`، فمفيش اختبار محتاج مفتاح حقيقي.

### النزاهة العلمية
ده مشروع علمي لـ NASA Space Apps. **ممنوع تخترع أرقام أو DOIs أو نتائج.** أي قيمة مش موجودة تتساب `null` وتتعرض "Not recorded". أي بيانات وهمية لازم تبان للمستخدم إنها وهمية. التفاصيل في `docs/SCIENTIFIC_INTEGRITY.md`.

### أول هدف مشترك (Milestone 1)
الباك إند شغال على Postgres فيه بيانات الخمس تجارب (BASS, SAFFIRE, FLEX, SAME, ACME)، والفرونت إند بيعرضهم من الـ API الحقيقي. المساعد بيجاوب سؤال واحد على الأقل باقتباس حقيقي من ورقة بحثية متخزنة (DOI ورقم صفحة)، والـ CI أخضر على `integration`.

> ملاحظة: `docs/TEAM_WORKFLOW.md` و`docs/TASK_BREAKDOWN.md` لسه مكتوبين على أساس شخصين. التقسيم ده هو المعتمد لحد ما يتحدّثوا.
