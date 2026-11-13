# العضو C: الذكاء الاصطناعي (RAG والمساعد والترتيب)

## إنت مسؤول عن إيه
المساعد البحثي اللي بيجاوب على الأسئلة من الأوراق العلمية المتخزنة بس، مع اقتباس موثق لكل معلومة (DOI ورقم الصفحة)، وبيرفض يجاوب لو مفيش دليل. وكمان محرك ترتيب الأهمية (Ranking).

## الفولدرات بتاعتك
| المسار | فيه إيه |
| :--- | :--- |
| `backend/app/rag/` | `chunker.py`، `embeddings.py`، `retriever.py`، `reranker.py`، `generator.py`، `citations.py` |
| `backend/app/ranking/` | `scoring.py` (المعادلة)، `explainability.py` (شرح النتيجة) |
| `backend/app/services/ai_service.py` | بيربط خطوات الـ RAG ببعض |
| `backend/app/services/ranking_service.py` | خدمة الترتيب |
| `backend/app/api/v1/endpoints/assistant.py`، `ranking.py` | `POST /api/v1/assistant/query`، `POST /api/v1/rank` |
| `backend/app/schemas/assistant.py`، `ranking.py` | شكل الـ request والـ response (لازم يطابق `docs/API_CONTRACT.md`) |

**ماتعدّلش في:** جداول قاعدة البيانات والـ migrations والـ ingestion (دي بتاعة B)، ولا الفرونت إند (ده بتاع A).

## المهام (بالترتيب)

### C-1: LLM حقيقي
- `GeminiLLMProvider` في `rag/generator.py` **مش بيكلم Gemini أصلًا**، بيرجع لـ `MockLLMProvider`. يعني لو حد عمل `AI_PROVIDER=gemini` هيفتكر إنه شغال وهو لأ.
- نفّذ الاستدعاء الحقيقي. الكومنت في `core/config.py` بيذكر كمان `openai` و`anthropic` (`OPENAI_API_KEY` موجود، لكن مفيش field لمفتاح Anthropic لسه). اعمل الـ provider اللي الفريق هيستخدمه بس.
- المفتاح يتقري من `.env` بس. ضيف timeout ومعالجة أخطاء.
- لو الـ provider الحقيقي فشل، **ماترجعش إجابة وهمية من غير ما تقول**. يا ترجّع خطأ واضح، يا الـ response يبقى فيه علامة إنه fallback.
- **تمام لما:** `AI_PROVIDER=gemini` + مفتاح = إجابة حقيقية من الموديل، و`AI_PROVIDER=mock` = كل الاختبارات ناجحة من غير إنترنت.

### C-2: Embeddings حقيقية
- نفس المشكلة في `rag/embeddings.py`: الـ Gemini provider بيرجع vector وهمي.
- نفّذ embeddings حقيقية، و**اتفق مع B على الـ dimension** (`EMBEDDING_DIMENSION`) لأن عمود pgvector هيتعمل بيه.
- اعمل سكريبت أو دالة تحسب الـ embeddings للـ chunks اللي B بيدخلها.

### C-3: Retriever على pgvector
- `rag/retriever.py` دلوقتي بيحسب cosine similarity في Python على كل الـ chunks. لما B يخلّص الـ migration بتاع pgvector، استخدم بحث pgvector في Postgres.
- خلّي طريقة Python للـ SQLite عشان الاختبارات.

### C-4: الاقتباسات والامتناع عن الإجابة
- كل جملة في الإجابة لازم تكون من chunk اتجاب فعلًا، والاقتباس فيه DOI ورقم الصفحة (`rag/citations.py`).
- لو الـ similarity أقل من الحد، المساعد **يرفض** ويشرح إن مفيش دليل كفاية.
- لو السؤال عن القمر أو المريخ والبيانات كلها من 0g، لازم يطلع تحذير إن الجاذبية الجزئية مش متغطية.
- **تمام لما:** في اختبارات بتثبت إن (1) مفيش اقتباس لمصدر مااتجبش، (2) سؤال برة الموضوع بيترفض، (3) التحذير بيظهر.

### C-5: محرك الترتيب
- راجع `ranking/scoring.py`: المعادلة `R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q`.
- اختبر الحالات الطرفية: قيم ناقصة، ونفس النتيجة لتجربتين، ومجال مش موجود.
- الشرح (`explainability.py`) لازم يقول كل نقطة جت منين، وكل response لازم يكون معاه التنبيه إن الترتيب **مش** تقييم لخطر الحريق.

### C-6: مجموعة تقييم
- اعمل 15-20 سؤال، ولكل سؤال المصدر الصح المتوقع، في `backend/app/tests/` أو `data/eval/`.
- سكريبت يقيس: نسبة الاقتباسات الصح، ونسبة الرفض الصح، والمصادر اللي اتجابت.
- **تمام لما:** تقدر تطلع رقم دقة قبل وبعد أي تغيير في الـ retriever أو الـ prompt.

## قبل أي PR
```bash
cd backend
ruff check .
USE_SQLITE_FALLBACK=true AI_PROVIDER=mock EMBEDDING_PROVIDER=mock pytest -v
```
- اختباراتك: `test_assistant.py`، `test_citations.py`، `test_ranking.py`.
- الفرع: `feature/ai-<اسم>`، والـ PR يروح على `integration`.
- **ممنوع أي اختبار يحتاج مفتاح API أو إنترنت**، لأن الـ CI بيشتغل بـ `mock`.
- عمرك ما تحط مفتاح في الكود أو في `.env.example`.
- لو غيرت شكل response المساعد، اتفق مع الـ Lead وA الأول (`docs/API_CONTRACT.md`).

## مراجع
`docs/SI_ENGINE_AND_RAG.md`، `docs/SCIENTIFIC_INTEGRITY.md`، `docs/decisions/ADR-003-ai-and-rag.md`، `docs/diagrams/rag_pipeline.mmd`
