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

export interface ToggledOptionGroupMetadata extends OptionMetadataBase {
  initialValue: boolean;
  group: { [key: string]: OptionMetadata };
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

function getInitialValue(metadata: OptionMetadata): OptionType {
  switch (metadata.type) {
    case 'boolean':
      return metadata.initialValue ?? false;
    case 'number':
      return metadata.initialValue ?? 0;
    case 'string':
      if (metadata.options !== undefined) {
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
    enabled: false,
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
