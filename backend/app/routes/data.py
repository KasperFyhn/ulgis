from typing import cast

from fastapi import Depends, APIRouter
from sqlalchemy import ColumnElement
from sqlalchemy.orm import Session, subqueryload

from app.db.base import SessionLocal
from app.db.models import TaxonomyOrm, TextContent
from app.logger import create_logger

logger = create_logger(__name__)

data_router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@data_router.get("/data/taxonomies")
def get_taxonomies(db: Session = Depends(get_db)):
    return db.query(TaxonomyOrm).options(subqueryload(TaxonomyOrm.group)).all()


@data_router.get("/data/taxonomy_descriptions", response_model=dict[str, str])
def get_taxonomy_texts(db: Session = Depends(get_db)) -> dict[str, str]:
    name_and_text = (
        db.query(TaxonomyOrm).add_columns(TaxonomyOrm.name, TaxonomyOrm.text).all()
    )
    return {taxonomy.name: taxonomy.text for taxonomy in name_and_text}


@data_router.get("/data/text_content/{name}")
def get_text_content(name: str, db: Session = Depends(get_db)):
    row = (
        db.query(TextContent)
        .filter(cast(ColumnElement[bool], TextContent.name == name))
        .one_or_none()
    )
    return row.text if row else None
