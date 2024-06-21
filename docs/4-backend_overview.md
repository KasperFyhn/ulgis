# Backend overview

The backend is built with FastAPI.

## Prompt generation
To generate a prompt the backend needs a user-provided `GenerationOptions` object. This holds crucial information about what information to put into the prompt - fill out the empty slots, essentially.

## Generation options metadata
For a user, in this case the front-end system, to know how such an object should look, a `GenerationOptionsMetadata` is requested via the `generation_options_metadata` endpoint. This returns an object akin to a JSON schema (1) which is created on the fly by inspecting the `Pydantic` model fields and their metadata.

(1) A standard JSON schema would certainly also be able to do the job, but during development it turned out better to create a custom-defined metadata object to give full control of the needed information.

## Models
Models are `Pydantic` to ensure data validation. It also allows for metadata inspection used for generation options metadata.

An **option** (constrained by `OptionType`) is a field that needs to be set for the prompt generation.

**Options** are grouped together in `OptionGroup`s which, in turn, can be grouped together in `ToggledOptionsGroupArray`s.

To describe what values are allowed, a `GenerationOptionsMetadata` contains group metadata and option metadata which hold the critical information for any user or service to "fill out" the models correctly.