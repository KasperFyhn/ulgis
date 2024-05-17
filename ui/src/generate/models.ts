// DATA CLASSES

export type OptionType = boolean | string | number | string[];

// TODO: do we want recursive structure?

export interface OptionGroup {
  [key: string]: OptionType;
}

export interface ToggledOptionGroup extends OptionGroup {
  enabled: boolean;
}

export function isEmptyOptionGroup(
  optionGroup: OptionGroup | ToggledOptionGroup,
): boolean {
  return (
    Object.entries(optionGroup).filter(([k, v]) => k !== 'enabled').length == 0
  );
}

export interface ToggledOptionGroupArray {
  [key: string]: ToggledOptionGroup;
}

export class GenerationOptions {
  [key: string]: OptionGroup | ToggledOptionGroupArray;

  taxonomies: ToggledOptionGroupArray = {};
  settings: OptionGroup = {};
  customInputs: OptionGroup = {};
  outputOptions: ToggledOptionGroupArray = {};
}

// METADATA CLASSES

export type UiLevel = 'simple' | 'standard' | 'advanced';

interface OptionMetadataBase {
  name: string;
  description?: string;
  uiLevel: UiLevel;
}

interface PrimitiveOptionMetadataBase<T extends OptionType>
  extends OptionMetadataBase {
  default?: T;
}

export interface BooleanOptionMetadata
  extends PrimitiveOptionMetadataBase<boolean> {
  type: 'boolean';
}

export interface StringOptionMetadata
  extends PrimitiveOptionMetadataBase<string> {
  type: 'string';
  options?: string[] | { [key: string]: string[] };
  short?: boolean;
}

export interface StringArrayOptionMetadata
  extends PrimitiveOptionMetadataBase<string[]> {
  type: 'stringArray';
  options?: string[];
}

export interface NumberOptionMetadata
  extends PrimitiveOptionMetadataBase<number> {
  type: 'number';
  min: number;
  max: number;
  step?: number;
}

export type OptionMetadata =
  | BooleanOptionMetadata
  | StringOptionMetadata
  | StringArrayOptionMetadata
  | NumberOptionMetadata;

export interface OptionGroupMetadata extends OptionMetadataBase {
  group: { [key: string]: OptionMetadata };
}

export interface ToggledOptionGroupMetadata extends OptionGroupMetadata {
  default: boolean;
}

export interface ToggledOptionGroupArrayMetadata extends OptionMetadataBase {
  multiple: boolean;
  groups: { [key: string]: ToggledOptionGroupMetadata };
}

export interface GenerationOptionsMetadata {
  taxonomies: ToggledOptionGroupArrayMetadata;
  settings: OptionGroupMetadata;
  customInputs: ToggledOptionGroupMetadata;
  outputOptions: ToggledOptionGroupArrayMetadata;
}

const UiLevels = {
  simple: 0,
  standard: 1,
  advanced: 2,
} as const;

function filterGroupByLevel(
  metadata: OptionGroupMetadata,
  uiLevel: UiLevel,
): OptionGroupMetadata {
  return {
    ...metadata,
    group: Object.fromEntries(
      Object.entries(metadata.group).filter(
        ([k, v]) => UiLevels[v.uiLevel] <= UiLevels[uiLevel],
      ),
    ),
  };
}

function filterToggledGroupByLevel(
  metadata: ToggledOptionGroupMetadata,
  uiLevel: UiLevel,
): ToggledOptionGroupMetadata {
  return {
    ...metadata,
    ...filterGroupByLevel(metadata, uiLevel),
  };
}

function filterToggledGroupArrayByLevel(
  metadata: ToggledOptionGroupArrayMetadata,
  uiLevel: UiLevel,
): ToggledOptionGroupArrayMetadata {
  return {
    ...metadata,
    groups: Object.fromEntries(
      Object.entries(metadata.groups)
        .filter(([k, v]) => UiLevels[v.uiLevel] <= UiLevels[uiLevel])
        .map(([k, v]) => [k, filterToggledGroupByLevel(v, uiLevel)]),
    ),
  };
}

export function filterByLevel(
  metadata: GenerationOptionsMetadata,
  uiLevel: UiLevel,
): GenerationOptionsMetadata {
  return {
    customInputs: filterToggledGroupByLevel(metadata.customInputs, uiLevel),
    outputOptions: filterToggledGroupArrayByLevel(
      metadata.outputOptions,
      uiLevel,
    ),
    settings: filterGroupByLevel(metadata.settings, uiLevel),
    taxonomies: filterToggledGroupArrayByLevel(metadata.taxonomies, uiLevel),
  };
}

// METADATA CREATION

interface Field {
  title?: string;
  description?: string;
}

interface SchemaRef {
  $ref: string;
}

interface FieldSchemaRef extends Field {
  title?: string;
  description?: string;
  allOf?: SchemaRef[];
  additionalProperties?: SchemaRef;
}

export interface ObjectSchema extends Field {
  properties: {
    [key: string]: ObjectSchema | OptionMetadata | SchemaRef | FieldSchemaRef;
  };
  additionalProperties?: ObjectSchema | SchemaRef;
}

export interface SchemaRoot extends ObjectSchema {
  $defs: { [key: string]: ObjectSchema };
}

export function resolveSchema(schemaRoot: SchemaRoot): ObjectSchema {
  const defs = schemaRoot.$defs;

  const resolveRef = (ref: string): ObjectSchema => {
    const split = ref.split('/');
    if (split.length > 1) {
      const name = split[split.length - 1];
      return defs[name];
    } else {
      throw Error();
    }
  };

  const resolveProperty = (
    property: SchemaRef | FieldSchemaRef | ObjectSchema | OptionMetadata,
  ) => {
    if ('$ref' in property) {
      property = resolveRef(property.$ref);
    } else if ('allOf' in property && property.allOf !== undefined) {
      property = {
        ...resolveRef(property.allOf[0].$ref),
        title: property.title,
        description: property.description,
      };
      if (
        'additionalProperties' in property &&
        property.additionalProperties !== undefined &&
        '$ref' in property.additionalProperties
      ) {
        property.additionalProperties = resolveRef(
          property.additionalProperties.$ref,
        );
      }
    }

    if ('properties' in property && property.properties !== undefined) {
      property.properties = Object.fromEntries(
        Object.entries(property.properties).map(([key, prop]) => [
          key,
          resolveProperty(prop),
        ]),
      );
    }

    return property;
  };

  return {
    properties: Object.fromEntries(
      Object.entries(schemaRoot.properties).map(([key, prop]) => [
        key,
        resolveProperty(prop),
      ]),
    ),
  };
}

// INITIALIZERS

function getDefault(metadata: OptionMetadata): OptionType {
  switch (metadata.type) {
    case 'boolean':
      return metadata.default ?? false;
    case 'number':
      return metadata.default ?? 0;
    case 'string':
      if (metadata.default) {
        return metadata.default;
      } else if (metadata.options) {
        if (Array.isArray(metadata.options)) {
          return metadata.options[0];
        } else {
          return Object.values(metadata.options)[0][0];
        }
      } else {
        return '';
      }
    case 'stringArray':
      return metadata.default ?? [];
  }
}

function initOptionGroup(metadata: OptionGroupMetadata): OptionGroup {
  return Object.fromEntries(
    Object.entries(metadata.group).map(([key, member]) => [
      key,
      getDefault(member) as OptionType,
    ]),
  );
}

function initToggledOptionGroup(
  metadata: ToggledOptionGroupMetadata,
): ToggledOptionGroup {
  return {
    enabled: metadata.default,
    ...Object.fromEntries(
      Object.entries(metadata.group).map(([key, member]) => [
        key,
        getDefault(member),
      ]),
    ),
  };
}

function initToggledOptionGroupArray(
  metadata: ToggledOptionGroupArrayMetadata,
): ToggledOptionGroupArray {
  return Object.fromEntries(
    Object.entries(metadata.groups).map(([key, memberMetadata]) => [
      key,
      initToggledOptionGroup(memberMetadata),
    ]),
  );
}

export function initGenerationOptions(
  metadata?: GenerationOptionsMetadata,
): GenerationOptions {
  if (metadata === undefined) {
    return {
      taxonomies: {},
      customInputs: {},
      outputOptions: {},
      settings: {},
    };
  } else {
    return {
      taxonomies: initToggledOptionGroupArray(metadata.taxonomies),
      customInputs: initToggledOptionGroup(metadata.customInputs),
      settings: initOptionGroup(metadata.settings),
      outputOptions: initToggledOptionGroupArray(metadata.outputOptions),
    };
  }
}
