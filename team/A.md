# العضو A: الواجهة الأمامية (Frontend)

## إنت مسؤول عن إيه
كل اللي المستخدم بيشوفه: صفحات Next.js 15 والمكونات والرسوم البيانية، وإزاي الواجهة بتكلم الـ API.

## الفولدرات بتاعتك
| المسار | فيه إيه |
| :--- | :--- |
| `frontend/app/` | الصفحات: `dashboard`، `investigations`، `investigations/[id]`، `compare`، `scenarios`، `assistant`، `insights` |
| `frontend/components/` | المكونات مقسمة حسب الصفحة، والمشترك منها في `shared/` و`layout/` |
| `frontend/hooks/` | `useOverview`، `useInvestigations`، `useCompare`، `useScenario`، `useAssistant` |
| `frontend/lib/api/` | `client.ts` (كل طلبات الـ API بتعدّي منه) و`endpoints.ts` |
| `frontend/lib/constants/`، `frontend/lib/utils/` | ثوابت ودوال مساعدة (تنسيق، وحدات) |
| `frontend/types/` | أنواع TypeScript، **ولازم تطابق** `docs/API_CONTRACT.md` |
| `frontend/tests/` | الاختبارات |

**ماتعدّلش في:** أي حاجة جوه `backend/`. لو محتاج field جديد من الـ API، اطلبه من الـ Lead وهو يضيفه في `docs/API_CONTRACT.md`.

## الصفحات والـ API اللي بتكلمه
| الصفحة | الـ Endpoint | صاحب الـ Endpoint |
| :--- | :--- | :--- |
| `/dashboard` | `GET /api/v1/overview` | Lead |
| `/investigations`، `/investigations/[id]` | `GET /api/v1/investigations`، `GET /api/v1/investigations/{id}` | Lead |
| `/compare` | `POST /api/v1/compare` | Lead |
| `/scenarios` | `POST /api/v1/scenarios/analyze` | Lead |
| `/assistant` | `POST /api/v1/assistant/query` | C |
| `/insights` | `POST /api/v1/rank` | C |
| شارة حالة الـ API في الـ Navbar | `GET /api/v1/health` | Lead |

## المهام (بالترتيب)

### A-1: شغّل الفرونت على الباك إند الحقيقي
- شغّل الباك إند محليًا (`docs/LOCAL_DEVELOPMENT.md`) والفرونت بـ `npm run dev`.
- لف على الصفحات السبعة وتأكد إن كل صفحة بتجيب بياناتها من الـ API فعلًا. سجّل أي اختلاف بين `frontend/types/` والـ response الحقيقي.
- **تمام لما:** كل الصفحات بتعرض بيانات حقيقية، وأي اختلاف في الأنواع اتصلّح أو اتبلّغ للـ Lead.

### A-2: البيانات الوهمية لازم تبان إنها وهمية
- `hooks/useInvestigations.ts` بيرجع لـ `FALLBACK_INVESTIGATIONS` من `lib/constants/mockData.ts` لو الـ API وقع، **والمستخدم مابيعرفش**.
- اعرض شريط واضح زي "Showing offline demo data, API unavailable" لما الـ fallback يشتغل، أو شيل الـ fallback وخلّي الصفحة تعرض حالة خطأ.
- **تمام لما:** لو قفلت الباك إند، كل صفحة بتوضح إن مفيش اتصال، ومفيش صفحة بتعرض أرقام وهمية كأنها حقيقية.

### A-3: حالات التحميل والخطأ والفاضي
- استخدم `LoadingSkeleton` و`EmptyState` و`ErrorBoundary` من `components/shared/` في كل الصفحات.
- القيم الناقصة تتعرض **"Not recorded"**، وعمرها ما تتحول لـ 0.

### A-4: اختبارات بجد
- السكريبت `"test"` في `package.json` آخره `|| echo '...'`، وده **بيخبّي أي فشل** فالـ CI مابيقعش أبدًا. شيل الجزء ده.
- اكتب اختبارات لـ `lib/utils/formatters.ts` و`lib/utils/units.ts` و`lib/api/client.ts` (تعامله مع الأخطاء).
- **تمام لما:** `npm test` بيفشل فعلًا لما اختبار يفشل، وكل الاختبارات ناجحة.

### A-5: كمّل الصفحات
- **Dashboard:** رسوم Recharts لتوزيع المجالات (`DomainDistribution`).
- **Compare:** تختار من 2 لـ 4 تجارب، وتبيّن الفرق بين القيم بوحداتها (kPa، cm/s)، وتعرض تحذير حدود المقارنة.
- **Scenarios:** تختار البيئة (Spacecraft / Lunar 0.166g / Mars 0.38g)، وتعرض حالات `Direct Match` / `Analogous Range` / `Extrapolated` والفجوات البحثية.
- **Assistant:** كل إجابة تحتها كروت الاقتباسات (`CitationViewer`)، وفيها DOI يتداس عليه ورقم الصفحة. ولو المساعد امتنع عن الإجابة، الرسالة تبان بشكل مختلف.
- Responsive على الموبايل (الـ Sidebar يتحول لـ drawer).

### A-6: الـ Build لازم ينجح
- `npm run build` و`npm run lint` لازم ينجحوا. الـ CI دلوقتي بيعمل typecheck بس، والـ Lead هيضيف الـ build.

## قبل أي PR
```bash
cd frontend
npm run typecheck
npm run lint
npm test
npm run build
```
- الفرع: `feature/fe-<اسم>`، والـ PR يروح على `integration`.
- لو غيرت في `package.json` قول ده في وصف الـ PR.

## مراجع
`docs/FRONTEND_GUIDE.md`، `docs/API_CONTRACT.md`، `docs/SCIENTIFIC_INTEGRITY.md`
