import {
  OptionGroup,
  OptionGroupMetadata,
  ToggledOptionGroupMetadata,
} from './models';
import { Options } from './Options';
import React from 'react';
import { HelpTooltip } from '../common/HelpTooltip';

export interface OptionGroupPanelProps {
  metadata: OptionGroupMetadata | ToggledOptionGroupMetadata;
  getAndSet: [() => OptionGroup, (v: OptionGroup) => void];
  horizontal?: boolean;
}

export const OptionGroupPanel: React.FC<OptionGroupPanelProps> = ({
  metadata,
  getAndSet,
  horizontal,
}: OptionGroupPanelProps) => {
  const [getOptionGroup, setOptionGroup] = getAndSet;
  return (
    <div
      className={horizontal ? 'flex-container--horiz' : 'flex-container--vert'}
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
          {paramMetadata.type !== 'boolean' && (
            <>
              <span>{paramMetadata.name}</span>
              {paramMetadata.description && (
                <HelpTooltip
                  tooltipId={paramMetadata.name}
                  content={paramMetadata.description}
                />
              )}
            </>
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
