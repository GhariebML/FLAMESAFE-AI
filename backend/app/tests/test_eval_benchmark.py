import os

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Base  # noqa: F401
from scripts.evaluate_rag import load_benchmark_data, run_evaluation


@pytest.mark.asyncio
async def test_rag_evaluation_benchmark_suite(db_session: AsyncSession):
    """
    Module 6 / Task C-6 Benchmark Evaluation Test Suite.
    Executes all 20 curated benchmark queries across grounded queries, partial-gravity inquiries,
    in-domain insufficient evidence queries, and out-of-domain inquiries.
    """
    bench_file, bench_data = load_benchmark_data()
    assert os.path.exists(bench_file), f"Benchmark dataset missing at {bench_file}"
    assert len(bench_data) >= 15, "Benchmark dataset must contain at least 15-20 test cases"

    # Execute evaluation on seeded database
    summary = await run_evaluation(db_session, bench_data)

    # Core performance metrics assertions
    assert summary["accuracy"] >= 90.0, f"Benchmark accuracy {summary['accuracy']}% below 90% threshold"
    assert summary["citation_recall"] >= 90.0, f"Citation recall {summary['citation_recall']}% below 90% threshold"
    assert summary["abstention_accuracy"] >= 90.0, f"Abstention accuracy {summary['abstention_accuracy']}% below 90%"
    assert summary["advisory_accuracy"] >= 90.0, f"Advisory recall {summary['advisory_accuracy']}% below 90%"
