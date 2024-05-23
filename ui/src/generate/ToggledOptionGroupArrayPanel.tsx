import React from 'react';
import {
  ToggledOptionGroup,
  ToggledOptionGroupArray,
  ToggledOptionGroupArrayMetadata,
} from './models';
import { ToggledOptionGroupPanel } from './ToggledOptionGroupPanel';
import { OptionGroupPanel } from './OptionGroupPanel';

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

  return (
    <div
      className={vertical ? 'flex-container--vert' : 'flex-container--horiz'}
    >
      {Object.entries(metadata.groups).map(([key, taxonomyMetadata]) => (
        <ToggledOptionGroupPanel
          equalSize
          key={key}
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
};
