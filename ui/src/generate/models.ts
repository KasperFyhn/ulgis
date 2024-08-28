// DATA CLASSES

export type OptionType = boolean | string | number | string[];

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
  options?: string[];
  short?: boolean;
}

export interface StringArrayOptionMetadata
  extends PrimitiveOptionMetadataBase<string[]> {
  type: 'stringArray';
  options?: string[];
  short?: boolean;
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

export type GroupMetadata =
  | OptionGroupMetadata
  | ToggledOptionGroupArrayMetadata;

export interface GenerationOptionsMetadata {
  [key: string]: GroupMetadata;

  taxonomies: GroupMetadata;
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
        return metadata.options[0];
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

function overwriteOptionGroupValues(
  metadata: OptionGroupMetadata | ToggledOptionGroupMetadata,
  optionGroup: OptionGroup | ToggledOptionGroup,
  prevOptionGroup: OptionGroup | ToggledOptionGroup,
): void {
  for (const [key, valueMetadata] of Object.entries(metadata.group)) {
    if (
      !optionGroup.hasOwnProperty(key) ||
      !prevOptionGroup.hasOwnProperty(key)
    ) {
      continue;
    }
    let prevValue;
    switch (valueMetadata.type) {
      case 'boolean':
        optionGroup[key] = prevOptionGroup[key];
        continue;
      case 'number':
        prevValue = prevOptionGroup[key] as number;
        if (
          // case with min and max
          (valueMetadata.min &&
            valueMetadata.min <= prevValue &&
            valueMetadata.max &&
            prevValue <= valueMetadata.max &&
            prevValue % (valueMetadata.step ?? 1) == 0) ||
          // case with categorical steps
          (valueMetadata.steps &&
            0 <= prevValue &&
            prevValue <= valueMetadata.steps.length)
        ) {
          optionGroup[key] = prevValue;
        }
        continue;
      case 'string':
        prevValue = prevOptionGroup[key] as string;
        if (
          // free text
          !valueMetadata.options ||
          // limited options
          valueMetadata.options.includes(prevValue)
        ) {
          optionGroup[key] = prevValue;
        }
        continue;
      case 'stringArray':
        const newValue = optionGroup[key] as string[];
        for (const prevElement of prevOptionGroup[key] as string[]) {
          if (
            // free text
            (!valueMetadata.options ||
              // limited options
              valueMetadata.options.includes(prevElement)) &&
            !newValue.includes(prevElement)
          ) {
            newValue.push(prevElement);
          }
        }
    }
  }
}

function overwriteToggledOptionGroupArrayValues(
  metadata: ToggledOptionGroupArrayMetadata,
  optionGroupArray: ToggledOptionGroupArray,
  prevOptionGroupArray: ToggledOptionGroupArray,
): void {
  // if multiple, toggle or disable anything
  // if only single, toggle a previously toggled option group if possible,
  // else pick the one that is toggled by default, if any
  const toBeToggled =
    Object.keys(prevOptionGroupArray).find(
      (key) =>
        optionGroupArray.hasOwnProperty(key) &&
        prevOptionGroupArray[key].enabled,
    ) ||
    Object.keys(optionGroupArray).find((key) => optionGroupArray[key].enabled);

  // overwrite state from previous; do toggling depending on situation
  for (const key of Object.keys(metadata.groups)) {
    if (!metadata.multiple) {
      optionGroupArray[key].enabled = key === toBeToggled;
    } else if (prevOptionGroupArray.hasOwnProperty(key)) {
      optionGroupArray[key].enabled = prevOptionGroupArray[key].enabled;
    }

    if (
      optionGroupArray.hasOwnProperty(key) &&
      prevOptionGroupArray.hasOwnProperty(key)
    ) {
      overwriteOptionGroupValues(
        metadata.groups[key],
        optionGroupArray[key],
        prevOptionGroupArray[key],
      );
    }
  }
}

export function overwriteFromPrevOptions(
  metadata: GenerationOptionsMetadata,
  options: GenerationOptions,
  prevOptions: GenerationOptions,
): void {
  for (const key of Object.keys(metadata)) {
    if (!options.hasOwnProperty(key) || !prevOptions.hasOwnProperty(key)) {
      continue;
    }
    switch (metadata[key].type) {
      case 'optionGroup':
        overwriteOptionGroupValues(
          metadata[key] as OptionGroupMetadata,
          options[key] as OptionGroup,
          prevOptions[key] as OptionGroup,
        );
        break;
      case 'toggledOptionGroupArray':
        overwriteToggledOptionGroupArrayValues(
          metadata[key] as ToggledOptionGroupArrayMetadata,
          options[key] as ToggledOptionGroupArray,
          prevOptions[key] as ToggledOptionGroupArray,
        );
    }
  }
}

export function initGenerationOptions(
  metadata?: GenerationOptionsMetadata,
  prevOptions?: GenerationOptions,
): GenerationOptions {
  if (metadata === undefined) {
    return {};
  } else {
    const options = Object.fromEntries(
      Object.entries(metadata).map(([key, subMetadata]) => {
        switch (subMetadata.type) {
          case 'optionGroup':
            return [key, initOptionGroup(subMetadata)];
          case 'toggledOptionGroupArray':
            return [key, initToggledOptionGroupArray(subMetadata)];
        }
      }),
    );
    if (prevOptions) {
      overwriteFromPrevOptions(metadata, options, prevOptions);
    }
    return options;
  }
}
