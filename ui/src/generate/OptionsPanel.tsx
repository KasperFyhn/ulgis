import {
  GenerationOptions,
  GroupMetadata,
  isEmptyOptionGroup,
  OptionGroup,
  OptionGroupMetadata,
  ToggledOptionGroup,
  ToggledOptionGroupArray,
  ToggledOptionGroupArrayMetadata,
  ToggledOptionGroupMetadata,
} from './models';
import React, { useState } from 'react';
import { ToggleButton } from '../common/input/ToggleButton';
import { Options } from './Options';
import { TooltipWrap } from '../common/HelpTooltip';

export interface OptionGroupPanelProps {
  metadata: OptionGroupMetadata | ToggledOptionGroupMetadata;
  optionGroup: OptionGroup;
  setOptionGroup: (v: OptionGroup) => void;
  horizontal?: boolean;
  leftDecoratorLine?: boolean;
}

export const OptionGroupPanel: React.FC<OptionGroupPanelProps> = ({
  metadata,
  optionGroup,
  setOptionGroup,
  horizontal,
  leftDecoratorLine,
}: OptionGroupPanelProps) => {
  return (
    <div
      className={
        (horizontal ? 'flex-container--horiz' : 'flex-container--vert') +
        (leftDecoratorLine ? ' group' : '')
      }
      style={
        horizontal
          ? {
              justifyContent: 'center',
              gap: '40px',
              margin: '20px',
            }
          : {}
      }
    >
      {Object.entries(metadata.group).map(([paramKey, paramMetadata]) => (
        <div key={paramKey}>
          <Options
            metadata={paramMetadata}
            value={optionGroup[paramKey]}
            setValue={(value) => {
              const obj = optionGroup;
              obj[paramKey] = value;
              setOptionGroup({ ...obj });
            }}
          />
        </div>
      ))}
    </div>
  );
};

export interface ToggledOptionGroupArrayPanelProps {
  metadata: ToggledOptionGroupArrayMetadata;
  optionGroupArray: ToggledOptionGroupArray;
  setOptionGroupArray: (value: ToggledOptionGroupArray) => void;
  vertical?: boolean;
}

// TODO: This component is really a mess. It works and looks fine, but the code
//  is not very well-structured.
export const ToggledOptionGroupArrayPanel: React.FC<
  ToggledOptionGroupArrayPanelProps
> = ({
  metadata,
  optionGroupArray,
  setOptionGroupArray,
  vertical,
}: ToggledOptionGroupArrayPanelProps) => {
  const toggleOptionGroup = (key: string, value: boolean): void => {
    if (!metadata.multiple) {
      if (!value) return;
      for (const optionGroupKey in optionGroupArray) {
        const optionGroup = optionGroupArray[optionGroupKey];
        optionGroup.enabled = false;
      }
    }
    const obj = optionGroupArray;
    obj[key].enabled = value;
    setOptionGroupArray({ ...obj });
  };

  const setValue = (key: string, value: unknown): void => {
    const obj = optionGroupArray;
    obj[key] = value as ToggledOptionGroup;
    setOptionGroupArray({ ...obj });
  };

  if (vertical) {
    return (
      <div className={'flex-container--vert'}>
        {Object.entries(metadata.groups).map(([key, taxonomyMetadata]) => (
          <div
            key={key}
            className={'flex-container__box--small flex-container--vert'}
          >
            <TooltipWrap tooltipId={key} content={taxonomyMetadata.description}>
              <ToggleButton
                checked={optionGroupArray[key].enabled}
                onChange={(value) => toggleOptionGroup(key, value)}
              >
                {taxonomyMetadata.name}
              </ToggleButton>
            </TooltipWrap>

            {optionGroupArray[key].enabled &&
              !isEmptyOptionGroup(optionGroupArray[key]) && (
                <OptionGroupPanel
                  metadata={taxonomyMetadata}
                  optionGroup={optionGroupArray[key]}
                  setOptionGroup={(value) => setValue(key, value)}
                  leftDecoratorLine
                />
              )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-container--vert">
      <div className={'flex-container--horiz'}>
        {Object.entries(metadata.groups).map(([key, taxonomyMetadata]) => (
          <TooltipWrap
            key={key}
            tooltipId={taxonomyMetadata.name}
            content={taxonomyMetadata.description}
          >
            <ToggleButton
              className="flex-container__box--equal-size"
              checked={optionGroupArray[key].enabled}
              onChange={(value) => toggleOptionGroup(key, value)}
            >
              {taxonomyMetadata.name}
            </ToggleButton>
          </TooltipWrap>
        ))}
      </div>
      <div className={'flex-container--horiz'}>
        {Object.entries(metadata.groups)
          .filter(
            ([key, _]) =>
              metadata.multiple ||
              (optionGroupArray[key].enabled &&
                !isEmptyOptionGroup(optionGroupArray[key])),
          )
          .map(([key, taxonomyMetadata]) => {
            return (
              <div key={key} className={'flex-container__box--equal-size'}>
                {optionGroupArray[key].enabled && key !== 'none' ? (
                  <OptionGroupPanel
                    key={key}
                    metadata={taxonomyMetadata}
                    optionGroup={optionGroupArray[key]}
                    setOptionGroup={(value) => setValue(key, value)}
                    horizontal={!metadata.multiple}
                    leftDecoratorLine={metadata.multiple}
                  />
                ) : (
                  <div />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export interface OptionsPanelProps {
  metadataEntry: [string, GroupMetadata];
  options: GenerationOptions;
  setOptions: (options: GenerationOptions) => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  metadataEntry,
  options,
  setOptions,
}: OptionsPanelProps) => {
  const [key, metadata] = metadataEntry;

  const [narrowWindow, setNarrowWindow] = useState<boolean>(
    window.innerWidth < 1000,
  );
  window.addEventListener('resize', () =>
    setNarrowWindow(window.innerWidth < 1000),
  );

  switch (metadata.type) {
    case 'optionGroup':
      return (
        <div key={key} className={'options-group'}>
          <h1>{metadata.name}</h1>
          <OptionGroupPanel
            key={key}
            metadata={metadata}
            optionGroup={options[key] as OptionGroup}
            setOptionGroup={(v) => {
              options[key] = v;
              setOptions({ ...options });
            }}
          />
        </div>
      );
    case 'toggledOptionGroupArray':
      return (
        <div key={key} className={'options-group'}>
          <h1>{metadata.name}</h1>
          <ToggledOptionGroupArrayPanel
            key={key}
            metadata={metadata}
            // TODO: fix this hack
            vertical={key !== 'taxonomies' || narrowWindow}
            optionGroupArray={options[key] as ToggledOptionGroupArray}
            setOptionGroupArray={(v) => {
              options[key] = v;
              setOptions({ ...options });
            }}
          />
        </div>
      );
  }
};
