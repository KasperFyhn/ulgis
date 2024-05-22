from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session, subqueryload

from app.db.base import SessionLocal
from app.db.models import TaxonomyOrm
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
