import React from 'react';
import {
  ToggledOptionGroupArray,
  ToggledOptionGroupArrayMetadata,
} from './models';
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
  return (
    <div
      className={vertical ? 'flex-container--vert' : 'flex-container--horiz'}
    >
      {Object.entries(metadata.groups).map(([key, taxonomyMetadata]) => (
        <ToggledOptionGroupPanel
          equalSize
          key={key}
          metadata={taxonomyMetadata}
          radioButtonName={metadata.multiple ? undefined : metadata.name}
          disableAll={() => {
            for (const optionGroupKey in getOptionGroupArray()) {
              const optionGroup = getOptionGroupArray()[optionGroupKey];
              optionGroup.enabled = false;
            }
          }}
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
