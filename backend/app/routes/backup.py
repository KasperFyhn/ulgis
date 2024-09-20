from fastapi import Depends, APIRouter, status

from app.db import backup
from app.logger import create_logger
from app.routes.auth import oauth2_scheme

logger = create_logger(__name__)

backup_router = APIRouter(prefix="/backup")


@backup_router.post("/create/{name}", status_code=status.HTTP_201_CREATED)
def create(name: str, token: str = Depends(oauth2_scheme)):
    backup.create_backup(name)


@backup_router.get("/list", response_model=list[str])
def list_backups(token: str = Depends(oauth2_scheme)):
    return backup.list_backups()


@backup_router.delete(
    "/delete/{name_and_timestamp}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_backup(name_and_timestamp: str, token: str = Depends(oauth2_scheme)):
    backup.delete_backup(name_and_timestamp)


@backup_router.post("/restore/{name_and_timestamp}")
def load_backup(name_and_timestamp: str, token: str = Depends(oauth2_scheme)):
    backup.load_backup(name_and_timestamp)
