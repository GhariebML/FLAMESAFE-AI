import subprocess
import sys


def run_migrations():
    print("Running Alembic database migrations...")
    result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"Migration error: {result.stderr}", file=sys.stderr)
        sys.exit(result.returncode)
    print("Migrations applied successfully.")


if __name__ == "__main__":
    run_migrations()
