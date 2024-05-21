from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base


class TaxonomyOrm(Base):
    __tablename__ = "taxonomies"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    short_description = Column(String)
    text = Column(Text)
    ui_level = Column(String)

    group: Mapped[list["ParameterOrm"]] = relationship(back_populates="taxonomy")


class ParameterOrm(Base):
    __tablename__ = "parameters"

    type = "number"  # for Pydantic discrimination between option metadata types
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    short_description = Column(String)
    default = Column(Integer)

    taxonomy_id = Column(Integer, ForeignKey("taxonomies.id"))
    taxonomy: Mapped[TaxonomyOrm] = relationship(back_populates="group")
