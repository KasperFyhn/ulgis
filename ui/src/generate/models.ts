// DATA CLASSES

export type OptionType = boolean | string | number | string[];

// TODO: do we want recursive structure?

export interface OptionGroup {
  [key: string]: OptionType;
}

export interface ToggledOptionGroup extends OptionGroup {
  enabled: boolean;
}

export interface ToggledOptionGroupArray {
  [key: string]: ToggledOptionGroup;
}

export class GenerationOptions {
  [key: string]: OptionGroup | ToggledOptionGroupArray;

  taxonomies: ToggledOptionGroupArray = {};
  settings: OptionGroup = {};
  customInputs: ToggledOptionGroup = {
    enabled: true,
  };
  outputOptions: ToggledOptionGroupArray = {};
}

// METADATA CLASSES

interface OptionMetadataBase {
  name: string;
  description?: string;
}

interface PrimitiveOptionMetadataBase<T extends OptionType>
  extends OptionMetadataBase {
  initialValue?: T;
}

export interface BooleanOptionMetadata
  extends PrimitiveOptionMetadataBase<boolean> {
  type: 'boolean';
}

export interface StringOptionMetadata
  extends PrimitiveOptionMetadataBase<string> {
  type: 'string';
  options?: string[];
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
  initialValue: boolean;
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

function getInitialValue(metadata: OptionMetadata): OptionType {
  switch (metadata.type) {
    case 'boolean':
      return metadata.initialValue ?? false;
    case 'number':
      return metadata.initialValue ?? 0;
    case 'string':
      if (metadata.options) {
        return metadata.initialValue ?? metadata.options[0];
      } else {
        return metadata.initialValue ?? '';
      }
    case 'stringArray':
      return metadata.initialValue ?? [];
  }
}

function initOptionGroup(metadata: OptionGroupMetadata): OptionGroup {
  return Object.fromEntries(
    Object.entries(metadata.group).map(([key, member]) => [
      key,
      getInitialValue(member) as OptionType,
    ]),
  );
}

function initToggledOptionGroup(
  metadata: ToggledOptionGroupMetadata,
): ToggledOptionGroup {
  return {
    enabled: metadata.initialValue,
    ...Object.fromEntries(
      Object.entries(metadata.group).map(([key, member]) => [
        key,
        getInitialValue(member),
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
      customInputs: {
        enabled: false,
      },
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
