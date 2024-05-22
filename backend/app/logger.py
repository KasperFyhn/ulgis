import logging
import sys


def create_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    _handler = logging.StreamHandler(sys.stdout)
    logger.setLevel(logging.DEBUG)  # fixme
    _handler.setFormatter(
        logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    )
    logger.addHandler(_handler)
    return logger
