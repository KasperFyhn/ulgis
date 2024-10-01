import datetime
import glob
import json
import os.path
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.base import Base, SQLALCHEMY_DATABASE_URL, SessionLocal
from app.db.models import AdminUserOrm

DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
DATABASE_DIR = Path(os.path.dirname(os.path.abspath(DATABASE_URL)))


def _timestamp():
    return datetime.datetime.now().isoformat()


def create_backup(name: str = ""):
    backup_file = DATABASE_DIR / f"backup_{name}@{_timestamp()}.json"

    db = SessionLocal()

    backup_data = {}

    for model in Base.__subclasses__():
        if model == AdminUserOrm:
            continue

        records = db.query(model).all()

        # noinspection PyTypeChecker
        serialized_records = [
            {c.name: getattr(record, c.name) for c in model.__table__.columns}
            for record in records
        ]

        backup_data[model.__tablename__] = serialized_records

    with open(backup_file, "w") as f:
        json.dump(backup_data, f, indent=2)

    db.close()


def overwrite_tables(backup_data: dict, db: Session):
    try:
        for table_name, records in backup_data.items():
            model = None
            for cls in Base.__subclasses__():
                if cls.__tablename__ == table_name:
                    model = cls
                    break

            if model:
                db.query(model).delete()

                for record in records:
                    db.add(model(**record))

        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def load_backup(name_and_timestamp: str):
    backup_file = DATABASE_DIR / f"backup_{name_and_timestamp}.json"
    db = SessionLocal()
    with open(backup_file, "r") as f:
        backup_data = json.load(f)
    overwrite_tables(backup_data, db)


def delete_backup(name_and_timestamp: str):
    os.remove(DATABASE_DIR / ("backup_" + name_and_timestamp + ".json"))


def list_backups():
    backups = [
        backup.split("_", maxsplit=1)[-1].replace(".json", "")
        for backup in glob.glob("backup_*", root_dir=DATABASE_DIR)
    ]
    backups.sort(key=lambda x: x.split("@")[-1])
    return backups
