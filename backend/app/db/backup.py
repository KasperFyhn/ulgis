import datetime
import glob
import os.path
import sqlite3

from app.db.base import SQLALCHEMY_DATABASE_URL

DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")


def _timestamp():
    return datetime.datetime.now().isoformat()


def create_backup(name: str = ""):
    with (
        sqlite3.connect(DATABASE_URL) as connection,
        sqlite3.connect(
            DATABASE_URL + "_" + name + "@" + _timestamp()
        ) as backup_connection,
    ):
        connection.backup(backup_connection)


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


def load_backup(name_and_timestamp: str):
    with (
        sqlite3.connect(DATABASE_URL) as connection,
        sqlite3.connect(DATABASE_URL + "_" + name_and_timestamp) as backup_connection,
    ):
        backup_connection.backup(connection)
