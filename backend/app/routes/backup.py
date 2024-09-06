from fastapi import Depends, APIRouter

from app.db import backup
from app.logger import create_logger
from app.routes.auth import oauth2_scheme

logger = create_logger(__name__)

backup_router = APIRouter()


@backup_router.post("/backup/create/{name}")
def create(name: str, token: str = Depends(oauth2_scheme)):
    backup.create_backup(name)


@backup_router.get("/backup/list", response_model=list[str])
def list_backups(token: str = Depends(oauth2_scheme)):
    return backup.list_backups()


@backup_router.post("/backup/delete/{name_and_timestamp}")
def delete_backup(name_and_timestamp: str, token: str = Depends(oauth2_scheme)):
    backup.delete_backup(name_and_timestamp)


@backup_router.post("/backup/restore/{name_and_timestamp}")
def load_backup(name_and_timestamp: str, token: str = Depends(oauth2_scheme)):
    backup.load_backup(name_and_timestamp)
