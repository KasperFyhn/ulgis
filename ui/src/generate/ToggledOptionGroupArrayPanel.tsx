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

  // if (Object.keys(metadata.groups).length == 1) {
  //   // if only a single member is there, show it as a regular group
  //   const [groupKey, groupMetadata] = Object.entries(metadata.groups)[0];
  //   if (!getOptionGroupArray()[groupKey].enabled) {
  //       // enable the one group if not already enabled
  //       const groupArray = getOptionGroupArray()
  //       groupArray[groupKey].enabled = true;
  //       setOptionGroupArray({ ...groupArray });
  //   }
  //   return (
  //     <OptionGroupPanel
  //       metadata={groupMetadata}
  //       getAndSet={[
  //         () => getOptionGroupArray()[groupKey],
  //         (value) => {
  //           const obj = getOptionGroupArray();
  //           obj[groupKey] = value as ToggledOptionGroup;
  //           setOptionGroupArray({ ...obj });
  //         },
  //       ]}
  //     />
  //   );
  // }

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
