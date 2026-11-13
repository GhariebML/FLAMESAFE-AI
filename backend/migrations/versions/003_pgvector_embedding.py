"""Migrate evidence_chunks embedding column to pgvector with HNSW index

Revision ID: 003_pgvector_embedding
Revises: 002_add_embedding_metadata
Create Date: 2026-11-13 17:00:00.000000

"""
import json
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "003_pgvector_embedding"
down_revision: str | None = "002_add_embedding_metadata"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

EMBEDDING_DIMENSION: int = 768


def upgrade() -> None:
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    if dialect_name == "postgresql":
        # 1. Ensure pgvector extension exists
        op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

        # 2. Validate existing non-null embeddings before altering column type
        # Abort migration with explicit exception if any embedding is malformed or wrong dimension
        validation_sql = f"""
        DO $$
        DECLARE
            invalid_count INTEGER;
        BEGIN
            SELECT COUNT(*) INTO invalid_count
            FROM evidence_chunks
            WHERE embedding IS NOT NULL
              AND (
                json_typeof(embedding::json) != 'array'
                OR json_array_length(embedding::json) != {EMBEDDING_DIMENSION}
              );

            IF invalid_count > 0 THEN
                RAISE EXCEPTION 'Migration aborted: % evidence_chunks record(s) contain embeddings that are not a {EMBEDDING_DIMENSION}-element numeric array.', invalid_count;
            END IF;
        END $$;
        """
        op.execute(validation_sql)

        # 3. Alter column type from JSON to vector(768) preserving NULLs
        op.execute(
            f"""
            ALTER TABLE evidence_chunks
            ALTER COLUMN embedding TYPE vector({EMBEDDING_DIMENSION})
            USING CASE
                WHEN embedding IS NULL THEN NULL
                ELSE embedding::text::vector({EMBEDDING_DIMENSION})
            END;
            """
        )

        # 4. Create HNSW index for cosine distance similarity
        op.execute(
            """
            CREATE INDEX IF NOT EXISTS ix_evidence_chunks_embedding_hnsw
            ON evidence_chunks USING hnsw (embedding vector_cosine_ops);
            """
        )

    else:
        # SQLite and other dialects fallback
        # Validate any non-null rows in Python if present
        rows = bind.execute(sa.text("SELECT id, embedding FROM evidence_chunks WHERE embedding IS NOT NULL")).fetchall()
        for row in rows:
            row_id, raw_emb = row[0], row[1]
            if isinstance(raw_emb, str):
                try:
                    parsed = json.loads(raw_emb)
                except (json.JSONDecodeError, UnicodeDecodeError) as e:
                    raise ValueError(f"Record {row_id} has invalid JSON embedding: {e}") from e
            elif isinstance(raw_emb, list):
                parsed = raw_emb
            else:
                raise TypeError(f"Record {row_id} has unsupported embedding type: {type(raw_emb)}")

            if not isinstance(parsed, list) or len(parsed) != EMBEDDING_DIMENSION:
                raise ValueError(
                    f"Record {row_id} embedding length {len(parsed) if isinstance(parsed, list) else 'non-list'} "
                    f"does not match required schema dimension {EMBEDDING_DIMENSION}"
                )


def downgrade() -> None:
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    if dialect_name == "postgresql":
        # 1. Drop HNSW index
        op.execute("DROP INDEX IF EXISTS ix_evidence_chunks_embedding_hnsw;")

        # 2. Convert vector back to JSON array (preserving NULLs, not stringified JSON)
        op.execute(
            """
            ALTER TABLE evidence_chunks
            ALTER COLUMN embedding TYPE JSON
            USING CASE
                WHEN embedding IS NULL THEN NULL
                ELSE embedding::text::json
            END;
            """
        )

    else:
        # SQLite fallback: no-op as schema remains JSON
        pass
