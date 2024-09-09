from typing import Iterable

from pydantic import Extra, Field

from app.db.models import TaxonomyOrm
from app.models._base import ToggledOptionGroup, OptionType, ToggledOptionGroupArray


class Taxonomy(ToggledOptionGroup):
    class Config:
        extra = Extra.allow

    def iter_options(self) -> Iterable[tuple[str, OptionType]]:
        return ((name, d) for name, d in self.model_extra.items())


class NoneTaxonomy(Taxonomy):
    priority: float = -1000


class StandardTaxonomyArray(ToggledOptionGroupArray):
    class Config:
        extra = Extra.allow
        depends = TaxonomyOrm
        ui_level = "Standard"

    multiple: bool = False

    none: NoneTaxonomy = Field(
        title="No Taxonomy",
        description="By toggling this, no background taxonomy is considered.",
    )

    def is_any_enabled(self) -> bool:
        # the "none" taxonomy is not checked since it will not be part of iter_taxonomies()
        return any(taxonomy.enabled for _, taxonomy in self.iter_taxonomies())

    def iter_taxonomies(self) -> Iterable[tuple[str, Taxonomy]]:
        return (
            (name, Taxonomy.model_validate(d)) for name, d in self.model_extra.items()
        )


class ModularTaxonomyArray(StandardTaxonomyArray):
    class Config:
        ui_level = "Modular"


class CombinableTaxonomyArray(ModularTaxonomyArray):
    class Config:
        ui_level = "Ample"

    none: None = None
    multiple: bool = True
