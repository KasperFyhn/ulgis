from fastapi_camelcase import CamelModel
from pydantic import Field

from app.models.custominputs import CustomInputs
from app.models.educationinfo import (
    EducationInfo,
    ModularEducationInfo,
    AdvancedEducationInfo,
)
from app.models.inspirationseeds import InspirationSeeds
from app.models.llmsettings import LlmSettings
from app.models.outputoptions import OutputOptions
from app.models.taxonomies import (
    StandardTaxonomyArray,
    ModularTaxonomyArray,
    CombinableTaxonomyArray,
)


class _GenerationOptionsBase(CamelModel):
    taxonomies: None = None
    education_info: None = None
    llm_settings: None = None
    inspiration_seeds: None = None
    output_options: None = None
    custom_inputs: None = None


class StandardGenerationOptions(_GenerationOptionsBase):
    taxonomies: StandardTaxonomyArray = Field(
        title="Taxonomies", description="Taxonomies"
    )
    education_info: EducationInfo = Field(title="Education Information")
    output_options: OutputOptions = Field(title="Output Options")


class ModularGenerationOptions(StandardGenerationOptions):
    taxonomies: ModularTaxonomyArray = Field(title="Taxonomies")
    education_info: ModularEducationInfo = Field(title="Education Information")
    inspiration_seeds: InspirationSeeds = Field(title="Inspiration Seeds")
    # llm_settings: BasicLlmSettings = Field(
    #     title="Text Generation"
    # )


class AmpleGenerationOptions(ModularGenerationOptions):
    taxonomies: CombinableTaxonomyArray = Field(title="Taxonomies")
    education_info: AdvancedEducationInfo = Field(title="Education Info")
    custom_inputs: CustomInputs = Field(title="Custom Inputs")
    llm_settings: LlmSettings = Field(title="Model Settings")


GenerationOptions = (
    AmpleGenerationOptions | ModularGenerationOptions | StandardGenerationOptions
)
