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
}

export const ToggledOptionGroupArrayPanel: React.FC<
  ToggledOptionGroupArrayPanelProps
> = ({ metadata, getAndSet }: ToggledOptionGroupArrayPanelProps) => {
  const [getOptionGroupArray, setOptionGroupArray] = getAndSet;
  return (
    <div className={'flex-container--horiz'}>
      {Object.entries(metadata.groups).map(([key, taxonomyMetadata]) => (
        <ToggledOptionGroupPanel
          key={key}
          metadata={taxonomyMetadata}
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
