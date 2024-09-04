from fastapi_camelcase import CamelModel

OptionType = bool | str | float | int | list[str]


class OptionGroup(CamelModel):
    """An Abstract class. Child classes should contain fields of type OptionType."""

    pass


class ToggledOptionGroup(CamelModel):
    """An Abstract class. Child classes should contain fields of type OptionType."""

    enabled: bool = False
    priority: float = 0.0


class ToggledOptionGroupArray(CamelModel):
    """An Abstract class. Child classes should contain fields of type ToggledOptionGroup."""

    multiple: bool = True
    pass
