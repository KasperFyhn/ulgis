import { OptionGroup, OptionGroupMetadata } from './models';
import { Options } from './Options';
import React from 'react';

export interface OptionGroupPanelProps {
  metadata: OptionGroupMetadata;
  getAndSet: [() => OptionGroup, (v: OptionGroup) => void];
}

export const OptionGroupPanel: React.FC<OptionGroupPanelProps> = ({
  metadata,
  getAndSet,
}: OptionGroupPanelProps) => {
  const [getOptionGroup, setOptionGroup] = getAndSet;
  return (
    <div>
      {Object.entries(metadata.group).map(([paramKey, paramMetadata]) => (
        <div key={paramKey}>
          {paramMetadata.name}
          <Options
            metadata={paramMetadata}
            getAndSet={[
              () => getOptionGroup()[paramKey],
              (value) => {
                const obj = getOptionGroup();
                obj[paramKey] = value;
                setOptionGroup({ ...obj });
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
};
