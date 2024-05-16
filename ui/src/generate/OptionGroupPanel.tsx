import { OptionGroup, OptionGroupMetadata } from './models';
import { Options } from './Options';
import React from 'react';
import { HelpTooltip } from '../common/HelpTooltip';

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
          <span>{paramMetadata.name}</span>
          {paramMetadata.description && (
            <HelpTooltip
              tooltipId={paramMetadata.name}
              content={paramMetadata.description}
            />
          )}
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
