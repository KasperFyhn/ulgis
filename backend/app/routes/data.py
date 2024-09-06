from typing import cast

from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy import ColumnElement
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, subqueryload

from app.db.base import get_db
from app.db.models import (
    TaxonomyOrm,
    TextContentOrm,
    TaxonomyOrmItem,
    TextContentItem,
    ParameterOrm,
)
from app.logger import create_logger
from app.routes.auth import oauth2_scheme

logger = create_logger(__name__)

data_router = APIRouter()


@data_router.get("/data/taxonomies")
def get_taxonomies(db: Session = Depends(get_db)):
    return [
        TaxonomyOrmItem.model_validate(item)
        for item in db.query(TaxonomyOrm).options(subqueryload(TaxonomyOrm.group)).all()
    ]


@data_router.put("/data/taxonomies", response_model=bool)
def put_or_update_taxonomy(
    arg_obj: TaxonomyOrmItem,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Add or update a taxonomy object in the database."""
    try:
        existing = (
            db.query(TaxonomyOrm)
            .filter(cast(ColumnElement[bool], TaxonomyOrm.name == arg_obj.name))
            .first()
        )

        obj = TaxonomyOrm(**{k: v for k, v in vars(arg_obj).items() if k != "group"})

        obj.group = [ParameterOrm(**item.dict()) for item in arg_obj.group]
        if existing is not None:
            obj.id = existing.id
        db.merge(obj)

        db.commit()  # Save changes to the database
        return True

    except SQLAlchemyError as e:
        db.rollback()  # Rollback in case of an error
        raise HTTPException(status_code=500, detail=str(e))


@data_router.delete("/data/taxonomies/{taxonomy_id}", response_model=bool)
def delete_taxonomy(
    taxonomy_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        existing = (
            db.query(TaxonomyOrm)
            .filter(cast(ColumnElement[bool], TaxonomyOrm.id == taxonomy_id))
            .first()
        )
        db.delete(existing)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()  # Rollback in case of an error
        raise HTTPException(status_code=500, detail=str(e))


@data_router.get("/data/taxonomy_descriptions", response_model=dict[str, str])
def get_taxonomy_texts(db: Session = Depends(get_db)) -> dict[str, str]:
    name_and_text = (
        db.query(TaxonomyOrm).add_columns(TaxonomyOrm.name, TaxonomyOrm.text).all()
    )
    return {taxonomy.name: taxonomy.text for taxonomy in name_and_text}


@data_router.get("/data/text_content")
def get_text_content_all(db: Session = Depends(get_db)):
    return [
        TextContentItem.model_validate(item) for item in db.query(TextContentOrm).all()
    ]


@data_router.get("/data/text_content/{name}")
def get_text_content(name: str, db: Session = Depends(get_db)):
    row = (
        db.query(TextContentOrm)
        .filter(cast(ColumnElement[bool], TextContentOrm.name == name))
        .one_or_none()
    )
    return row.text if row else None


@data_router.put("/data/text_content", response_model=bool)
def put_or_update_text_content(
    text_content: TextContentItem,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Add or update a taxonomy object in the database."""
    try:
        obj = (
            db.query(TextContentOrm)
            .filter(cast(ColumnElement[bool], TextContentOrm.name == text_content.name))
            .first()
        )
        if obj is not None:
            obj.text = text_content.text
        else:
            obj = TextContentOrm(**TextContentItem.dict())

        db.merge(obj)
        db.commit()  # Save changes to the database
        return True

    except SQLAlchemyError as e:
        db.rollback()  # Rollback in case of an error
        raise HTTPException(status_code=500, detail=str(e))
