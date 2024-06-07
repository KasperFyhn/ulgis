import React from 'react';
import {
  isEmptyOptionGroup,
  ToggledOptionGroup,
  ToggledOptionGroupArray,
  ToggledOptionGroupArrayMetadata,
} from './models';
import { ToggleButton } from '../common/ToggleButton';
import { OptionGroupPanel } from './OptionGroupPanel';

export interface ToggledOptionGroupArrayPanelProps {
  metadata: ToggledOptionGroupArrayMetadata;
  getAndSet: [
    () => ToggledOptionGroupArray,
    (value: ToggledOptionGroupArray) => void,
  ];
  vertical?: boolean;
}

export const ToggledOptionGroupArrayPanel: React.FC<
  ToggledOptionGroupArrayPanelProps
> = ({ metadata, getAndSet, vertical }: ToggledOptionGroupArrayPanelProps) => {
  const [getOptionGroupArray, setOptionGroupArray] = getAndSet;

  const toggleOptionGroup = (key: string, value: boolean): void => {
    if (!metadata.multiple) {
      if (!value) return;
      for (const optionGroupKey in getOptionGroupArray()) {
        const optionGroup = getOptionGroupArray()[optionGroupKey];
        optionGroup.enabled = false;
      }
    }
    const obj = getOptionGroupArray();
    obj[key].enabled = value;
    setOptionGroupArray({ ...obj });
  };

  const setValue = (key: string, value: unknown): void => {
    const obj = getOptionGroupArray();
    obj[key] = value as ToggledOptionGroup;
    setOptionGroupArray({ ...obj });
  };

  if (vertical) {
    return (
      <div className={'flex-container--vert'}>
        {Object.entries(metadata.groups).map(([key, taxonomyMetadata]) => (
          <div key={key} className={'flex-container__box flex-container--vert'}>
            <ToggleButton
              checked={getOptionGroupArray()[key].enabled}
              onChange={(value) => toggleOptionGroup(key, value)}
            >
              {taxonomyMetadata.name}
            </ToggleButton>

            {getOptionGroupArray()[key].enabled &&
              !isEmptyOptionGroup(getOptionGroupArray()[key]) && (
                <div className={'group'}>
                  <OptionGroupPanel
                    metadata={taxonomyMetadata}
                    getAndSet={[
                      () => getOptionGroupArray()[key],
                      (value) => setValue(key, value),
                    ]}
                  />
                </div>
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
          <ToggleButton
            className="flex-container__box--equal-size"
            key={key}
            checked={getOptionGroupArray()[key].enabled}
            onChange={(value) => toggleOptionGroup(key, value)}
          >
            {taxonomyMetadata.name}
          </ToggleButton>
        ))}
      </div>
      <div className={'flex-container--horiz'}>
        {metadata.multiple
          ? Object.entries(metadata.groups).map(([key, taxonomyMetadata]) => {
              return (
                <div key={key} className={'flex-container__box--equal-size'}>
                  {getOptionGroupArray()[key].enabled && key !== 'none' ? (
                    <div className={'group'}>
                      <OptionGroupPanel
                        key={key}
                        metadata={taxonomyMetadata}
                        getAndSet={[
                          () => getOptionGroupArray()[key],
                          (value) => setValue(key, value),
                        ]}
                      />
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              );
            })
          : Object.entries(metadata.groups)
              .filter(
                ([key, _]) =>
                  getOptionGroupArray()[key].enabled && key !== 'none',
              )
              .map(([key, taxonomyMetadata]) => (
                <div key={key} className={'flex-container__box'}>
                  <OptionGroupPanel
                    key={key}
                    metadata={taxonomyMetadata}
                    getAndSet={[
                      () => getOptionGroupArray()[key],
                      (value) => setValue(key, value),
                    ]}
                    horizontal
                  />
                </div>
              ))}
      </div>
    </div>
  );
};
