from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base


class Taxonomy(Base):
    __tablename__ = "taxonomies"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    short_description = Column(String)
    text = Column(Text)

    parameters: Mapped[list["Parameter"]] = relationship(back_populates="taxonomy")


class Parameter(Base):
    __tablename__ = "parameters"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    short_description = Column(String)
    min = Column(Integer)
    max = Column(Integer)
    step = Column(Integer)
    default = Column(Integer)

    taxonomy_id = Column(Integer, ForeignKey("taxonomies.id"))
    taxonomy: Mapped[Taxonomy] = relationship(back_populates="parameters")
