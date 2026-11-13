import asyncio
import json
import os
import sys

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.logging import logger
from app.models.base import Base
from app.schemas.assistant import AssistantQueryRequest
from app.services.ai_service import AIService
from scripts.seed_data import seed_database_if_empty


def find_benchmark_file() -> str:
    candidates = [
        os.path.join(backend_root, "..", "data", "eval", "rag_eval_benchmark.json"),
        os.path.join("data", "eval", "rag_eval_benchmark.json"),
        os.path.join(backend_root, "data", "eval", "rag_eval_benchmark.json"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    raise FileNotFoundError("Could not locate rag_eval_benchmark.json in data/eval/")


def load_benchmark_data() -> tuple[str, list[dict]]:
    path = find_benchmark_file()
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return path, data


async def run_evaluation(session: AsyncSession, benchmark_data: list[dict]) -> dict:
    ai_service = AIService(session)
    results = []

    total_queries = len(benchmark_data)
    correct_queries = 0
    correct_abstentions = 0
    total_expected_abstentions = 0
    correct_citations = 0
    total_expected_citations = 0
    correct_advisories = 0
    total_expected_advisories = 0

    for item in benchmark_data:
        qid = item["id"]
        query = item["query"]
        category = item["category"]
        expected_abstain = item["expected_abstain"]
        expected_acronym = item.get("expected_acronym")
        expected_advisory = item.get("expected_advisory", False)

        req = AssistantQueryRequest(query=query, max_citations=3)
        res = await ai_service.answer_query(req)

        actual_abstain = not res.has_sufficient_evidence
        actual_advisory = (
            "partial-gravity advisory" in res.answer.lower()
            or "partial-gravity extrapolation notice" in (res.scientific_uncertainty_note or "").lower()
        )

        # Check citation match
        actual_acronyms = [c.investigation_acronym for c in res.citations]

        citation_ok = True
        if expected_acronym:
            total_expected_citations += 1
            citation_ok = expected_acronym in actual_acronyms
            if citation_ok:
                correct_citations += 1

        # Check abstention match
        if expected_abstain:
            total_expected_abstentions += 1
            abstain_ok = actual_abstain
            if abstain_ok:
                correct_abstentions += 1
        else:
            abstain_ok = not actual_abstain

        # Check advisory match
        if expected_advisory:
            total_expected_advisories += 1
            advisory_ok = actual_advisory
            if advisory_ok:
                correct_advisories += 1
        else:
            # For out-of-domain or standard queries, advisory must NOT appear
            advisory_ok = not actual_advisory

        is_item_correct = abstain_ok and citation_ok and advisory_ok
        if is_item_correct:
            correct_queries += 1

        results.append({
            "id": qid,
            "category": category,
            "query": query,
            "expected_abstain": expected_abstain,
            "actual_abstain": actual_abstain,
            "expected_acronym": expected_acronym,
            "actual_acronyms": actual_acronyms,
            "expected_advisory": expected_advisory,
            "actual_advisory": actual_advisory,
            "passed": is_item_correct,
        })

    accuracy = (correct_queries / total_queries) * 100.0 if total_queries > 0 else 0.0
    abstention_accuracy = (
        (correct_abstentions / total_expected_abstentions) * 100.0 if total_expected_abstentions > 0 else 100.0
    )
    citation_recall = (
        (correct_citations / total_expected_citations) * 100.0 if total_expected_citations > 0 else 100.0
    )
    advisory_accuracy = (
        (correct_advisories / total_expected_advisories) * 100.0 if total_expected_advisories > 0 else 100.0
    )

    return {
        "total_queries": total_queries,
        "correct_queries": correct_queries,
        "accuracy": round(accuracy, 2),
        "citation_recall": round(citation_recall, 2),
        "abstention_accuracy": round(abstention_accuracy, 2),
        "advisory_accuracy": round(advisory_accuracy, 2),
        "results": results,
    }


def print_evaluation_report(eval_summary: dict):
    print("\n" + "=" * 80)
    print(" FLAMESAFE AI — RAG & CITATION ACCURACY BENCHMARK REPORT (TASK C-6)")
    print("=" * 80)
    print(f" Total Benchmark Inquiries:       {eval_summary['total_queries']}")
    print(f" Correct Predictions:            {eval_summary['correct_queries']} / {eval_summary['total_queries']}")
    print(f" Overall Benchmark Accuracy:     {eval_summary['accuracy']}%")
    print(f" Citation Retrieval Recall:      {eval_summary['citation_recall']}%")
    print(f" Abstention / Rejection Accuracy: {eval_summary['abstention_accuracy']}%")
    print(f" Partial-Gravity Advisory Recall: {eval_summary['advisory_accuracy']}%")
    print("-" * 80)
    print(f"{'ID':<10} | {'Category':<22} | {'Abstain':<8} | {'Citation':<10} | {'Advisory':<8} | Status")
    print("-" * 80)
    for r in eval_summary["results"]:
        status = "PASS" if r["passed"] else "FAIL"
        abstain_flag = f"{r['actual_abstain']!s:<8}"
        acronyms_str = f"{','.join(r['actual_acronyms'])[:9]:<10}"
        adv_flag = f"{r['actual_advisory']!s:<8}"
        print(f"{r['id']:<10} | {r['category']:<22} | {abstain_flag} | {acronyms_str} | {adv_flag} | {status}")
    print("=" * 80 + "\n")


async def main():
    bench_file, bench_data = load_benchmark_data()

    logger.info(f"Loaded {len(bench_data)} benchmark items from {bench_file}")

    # Use in-memory SQLite for self-contained, reproducible evaluation
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with session_factory() as session:
        await seed_database_if_empty(session)
        summary = await run_evaluation(session, bench_data)

    print_evaluation_report(summary)

    if summary["accuracy"] < 90.0:
        logger.error(f"Benchmark accuracy ({summary['accuracy']}%) is below the 90% threshold.")
        sys.exit(1)
    else:
        logger.info(f"Benchmark PASSED with {summary['accuracy']}% accuracy!")
        sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())