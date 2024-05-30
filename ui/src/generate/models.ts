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
  return Object.keys(optionGroup).filter((k) => k !== 'enabled').length == 0;
}

export interface ToggledOptionGroupArray {
  [key: string]: ToggledOptionGroup;
}

export class GenerationOptions {
  [key: string]: OptionGroup | ToggledOptionGroupArray;
}

// METADATA CLASSES

export type UiLevel = 'Standard' | 'Modular' | 'Ample';

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
  min?: number;
  max?: number;
  step?: number;
  steps?: string[];
}

export type OptionMetadata =
  | BooleanOptionMetadata
  | StringOptionMetadata
  | StringArrayOptionMetadata
  | NumberOptionMetadata;

export interface OptionGroupMetadata extends OptionMetadataBase {
  type: 'optionGroup';
  group: { [key: string]: OptionMetadata };
}

export interface ToggledOptionGroupMetadata extends OptionMetadataBase {
  type: 'toggledOptionGroup';
  default: boolean;
  group: { [key: string]: OptionMetadata };
}

export interface ToggledOptionGroupArrayMetadata extends OptionMetadataBase {
  type: 'toggledOptionGroupArray';
  multiple: boolean;
  groups: { [key: string]: ToggledOptionGroupMetadata };
}

export interface GenerationOptionsMetadata {
  [key: string]:
    | OptionGroupMetadata
    | ToggledOptionGroupMetadata
    | ToggledOptionGroupArrayMetadata;
}

const UiLevel = {
  // TODO: consider this: being the lowest should ultimately be decided by its
  //  parents, right?
  Inherit: -1,
  Standard: 0,
  Modular: 1,
  Ample: 2,
} as const;

function filterGroupByLevel(
  metadata: OptionGroupMetadata,
  uiLevel: UiLevel,
): OptionGroupMetadata {
  return {
    ...metadata,
    group: Object.fromEntries(
      Object.entries(metadata.group).filter(
        (entry) => UiLevel[entry[1].uiLevel] <= UiLevel[uiLevel],
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
    group: Object.fromEntries(
      Object.entries(metadata.group).filter(
        (entry) => UiLevel[entry[1].uiLevel] <= UiLevel[uiLevel],
      ),
    ),
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
        .filter((entry) => UiLevel[entry[1].uiLevel] <= UiLevel[uiLevel])
        .map(([k, v]) => [k, filterToggledGroupByLevel(v, uiLevel)]),
    ),
  };
}

export function filterByLevel(
  metadata: GenerationOptionsMetadata,
  uiLevel: UiLevel,
): GenerationOptionsMetadata {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, subMetadata]) => {
      switch (subMetadata.type) {
        case 'optionGroup':
          return [key, filterGroupByLevel(subMetadata, uiLevel)];
        case 'toggledOptionGroup':
          return [key, filterToggledGroupByLevel(subMetadata, uiLevel)];
        case 'toggledOptionGroupArray':
          return [key, filterToggledGroupArrayByLevel(subMetadata, uiLevel)];
      }
    }),
  );
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
    return {};
  } else {
    return Object.fromEntries(
      Object.entries(metadata).map(([key, subMetadata]) => {
        switch (subMetadata.type) {
          case 'optionGroup':
            return [key, initOptionGroup(subMetadata)];
          case 'toggledOptionGroup':
            return [key, initToggledOptionGroup(subMetadata)];
          case 'toggledOptionGroupArray':
            return [key, initToggledOptionGroupArray(subMetadata)];
        }
      }),
    );
  }
}
