from typing import Optional

from fastapi_camelcase import CamelModel
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base


class TaxonomyOrm(Base):
    __tablename__ = "taxonomies"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    short_description = Column(String)
    text = Column(Text)
    ui_level = Column(String)
    priority = Column(Float)

    group: Mapped[list["ParameterOrm"]] = relationship(
        back_populates="taxonomy",
        # backref="taxonomy",
        cascade="all, delete-orphan",  # Enables cascading updates and deletions
        passive_deletes=True,  # Allows cascading delete of children if the parent is deleted
    )


class TaxonomyOrmItem(CamelModel):
    class Config:
        from_attributes = True

    id: Optional[int] = None
    name: str
    short_description: str
    text: str
    ui_level: str
    priority: float
    group: Optional[list["ParameterOrmItem"]] = None


class ParameterOrm(Base):
    __tablename__ = "parameters"

    # static setup for parameters
    type = "number"  # for Pydantic discrimination between option metadata types
    steps = ["disabled", "fundamental", "intermediate", "advanced", "specialised"]
    default = 1

    # fields
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    short_description = Column(String)

    taxonomy_id = Column(Integer, ForeignKey("taxonomies.id"))
    taxonomy: Mapped[TaxonomyOrm] = relationship(back_populates="group")


class ParameterOrmItem(CamelModel):
    class Config:
        from_attributes = True

    id: Optional[int] = None
    name: str
    short_description: Optional[str]


class TextContentOrm(Base):
    __tablename__ = "text_content"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    text = Column(Text)


class TextContentItem(BaseModel):
    class Config:
        from_attributes = True

    name: str
    text: str


class AdminUserOrm(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    password_hash = Column(String)


class AdminUserItem(BaseModel):
    name: str
    password_hash: str
