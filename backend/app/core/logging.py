import logging
import sys
from app.core.config import settings

def setup_logging():
    log_format = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logging.basicConfig(
        level=level,
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
    # Set third party loggers to warning
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    return logging.getLogger("flamesafe")

logger = setup_logging()
