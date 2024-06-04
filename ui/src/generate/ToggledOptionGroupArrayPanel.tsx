import React from 'react';
import {
  ToggledOptionGroup,
  ToggledOptionGroupArray,
  ToggledOptionGroupArrayMetadata,
} from './models';
import { ToggleButton } from '../common/ToggleButton';
import { OptionGroupPanel } from './OptionGroupPanel';
import { ToggledOptionGroupPanel } from './ToggledOptionGroupPanel';

export interface ToggledOptionGroupArrayPanelProps {
  metadata: ToggledOptionGroupArrayMetadata;
  getAndSet: [
    () => ToggledOptionGroupArray,
    (value: ToggledOptionGroupArray) => void,
  ];
  vertical?: boolean;
  split?: boolean;
}

export const ToggledOptionGroupArrayPanel: React.FC<
  ToggledOptionGroupArrayPanelProps
> = ({ metadata, getAndSet, vertical }: ToggledOptionGroupArrayPanelProps) => {
  const [getOptionGroupArray, setOptionGroupArray] = getAndSet;

  if (vertical) {
    return (
      <div className={'flex-container--vert'}>
        {Object.entries(metadata.groups).map(([key, taxonomyMetadata]) => (
          <ToggledOptionGroupPanel
            key={key}
            equalSize
            metadata={taxonomyMetadata}
            disableAll={
              metadata.multiple
                ? undefined
                : () => {
                    for (const optionGroupKey in getOptionGroupArray()) {
                      const optionGroup = getOptionGroupArray()[optionGroupKey];
                      optionGroup.enabled = false;
                    }
                  }
            }
            getAndSet={[
              () => getOptionGroupArray()[key],
              (value) => {
                const obj = getOptionGroupArray();
                obj[key] = value;
                setOptionGroupArray({ ...obj });
              },
            ]}
          />
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
            onChange={(value) => {
              if (!metadata.multiple) {
                for (const optionGroupKey in getOptionGroupArray()) {
                  const optionGroup = getOptionGroupArray()[optionGroupKey];
                  optionGroup.enabled = false;
                }
              }
              const obj = getOptionGroupArray();
              obj[key].enabled = value;
              setOptionGroupArray({ ...obj });
            }}
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
                        metadata={{ ...taxonomyMetadata, type: 'optionGroup' }}
                        getAndSet={[
                          () => getOptionGroupArray()[key],
                          (value) => {
                            const obj = getOptionGroupArray();
                            obj[key] = value as ToggledOptionGroup;
                            setOptionGroupArray({ ...obj });
                          },
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
                ([key, taxonomyMetadata]) =>
                  getOptionGroupArray()[key].enabled && key !== 'none',
              )
              .map(([key, taxonomyMetadata]) => (
                <div key={key} className={'flex-container__box'}>
                  <OptionGroupPanel
                    key={key}
                    metadata={{ ...taxonomyMetadata, type: 'optionGroup' }}
                    getAndSet={[
                      () => getOptionGroupArray()[key],
                      (value) => {
                        const obj = getOptionGroupArray();
                        obj[key] = value as ToggledOptionGroup;
                        setOptionGroupArray({ ...obj });
                      },
                    ]}
                    horizontal
                  />
                </div>
              ))}
      </div>
    </div>
  );
};
