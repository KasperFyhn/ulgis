import datetime
import glob
import os.path
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

from app.db.base import Base, SQLALCHEMY_DATABASE_URL

DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")


def _timestamp():
    return datetime.datetime.now().isoformat()


def _clean_dict(d):
    """Remove SQLAlchemy state from dict."""
    return {k: v for k, v in d.items() if not k.startswith("_sa_")}


def transfer_tables(source_engine, target_engine, excluded_tables=None):
    if excluded_tables is None:
        excluded_tables = []

    source_session = sessionmaker(bind=source_engine)()
    target_session = sessionmaker(bind=target_engine)()

    try:
        # Create tables in the target database
        Base.metadata.create_all(target_engine)

        # Get all tables
        inspector = inspect(source_engine)
        tables = inspector.get_table_names()

        for table_name in tables:
            if table_name not in excluded_tables:
                # Get the table's model
                model = None
                for cls in Base.__subclasses__():
                    if cls.__tablename__ == table_name:
                        model = cls
                        break

                if model:
                    target_session.query(model).delete()
                    records = source_session.query(model).all()
                    for record in records:
                        cleaned_dict = _clean_dict(record.__dict__)
                        target_session.add(model(**cleaned_dict))

        target_session.commit()

    finally:
        source_session.close()
        target_session.close()


def create_backup(name: str = ""):
    backup_file = f"{DATABASE_URL}_{name}@{_timestamp()}"
    source_engine = create_engine(SQLALCHEMY_DATABASE_URL)
    backup_engine = create_engine(f"sqlite:///{backup_file}")

    transfer_tables(source_engine, backup_engine, excluded_tables=["admins"])


def load_backup(name_and_timestamp: str):
    backup_file = f"{DATABASE_URL}_{name_and_timestamp}"
    target_engine = create_engine(SQLALCHEMY_DATABASE_URL)
    backup_engine = create_engine(f"sqlite:///{backup_file}")

    transfer_tables(backup_engine, target_engine, excluded_tables=["admins"])


def delete_backup(name_and_timestamp: str) -> bool:
    try:
        os.remove(DATABASE_URL + "_" + name_and_timestamp)
        return True
    except OSError:
        return False


def list_backups():
    backups = [backup.split("_")[-1] for backup in glob.glob(DATABASE_URL + "_*")]
    backups.sort(key=lambda x: x.split("@")[-1])
    return backups
