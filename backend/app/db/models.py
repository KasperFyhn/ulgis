from sqlalchemy import Boolean, Column, Integer, String, Text

from app.db.base import Base


class Taxonomy(Base):
    __tablename__ = "taxonomies"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    short_description = Column(String)
    text = Column(Text)


