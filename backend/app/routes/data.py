from typing import cast

from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy import ColumnElement
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, subqueryload

from app.db.base import get_db
from app.db.models import (
    TaxonomyOrm,
    TextContent,
    TaxonomyOrmItem,
    TextContentItem,
)
from app.logger import create_logger

logger = create_logger(__name__)

data_router = APIRouter()


@data_router.get("/data/taxonomies")
def get_taxonomies(db: Session = Depends(get_db)):
    return [
        TaxonomyOrmItem.model_validate(item)
        for item in db.query(TaxonomyOrm).options(subqueryload(TaxonomyOrm.group)).all()
    ]


@data_router.put("/data/taxonomies", response_model=bool)
def put_or_update_taxonomy(arg_obj: TaxonomyOrmItem, db: Session = Depends(get_db)):
    """Add or update a taxonomy object in the database."""
    try:
        existing = (
            db.query(TaxonomyOrm)
            .filter(cast(ColumnElement[bool], TaxonomyOrm.name == arg_obj.name))
            .first()
        )
        if existing:
            for key, value in vars(arg_obj).items():
                if key == "group":
                    # value = [ParameterOrm(**item.dict()) for item in value]
                    # print([vars(v) for v in value])
                    continue

                setattr(existing, key, value)
        else:
            obj = TaxonomyOrm(
                **{k: v for k, v in vars(arg_obj).items() if k != "group"}
            )
            db.add(obj)

        db.commit()  # Save changes to the database
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
        TextContentItem.model_validate(item) for item in db.query(TextContent).all()
    ]


@data_router.get("/data/text_content/{name}")
def get_text_content(name: str, db: Session = Depends(get_db)):
    row = (
        db.query(TextContent)
        .filter(cast(ColumnElement[bool], TextContent.name == name))
        .one_or_none()
    )
    return row.text if row else None
