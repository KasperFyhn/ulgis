import React from 'react';
import {
  OptionGroup,
  ToggledOptionGroup,
  ToggledOptionGroupMetadata,
} from './models';
import { Options } from './Options';
import { OptionGroupPanel } from './OptionGroupPanel';

export interface ToggledOptionGroupPanelProps {
  metadata: ToggledOptionGroupMetadata;
  getAndSet: [() => ToggledOptionGroup, (value: ToggledOptionGroup) => void];
}

export const ToggledOptionGroupPanel: React.FC<
  ToggledOptionGroupPanelProps
> = ({ metadata, getAndSet }: ToggledOptionGroupPanelProps) => {
  const [getOptionGroup, setOptionGroup] = getAndSet;
  return (
    <div className={'flex-container__box'}>
      {metadata.name}
      <Options
        metadata={{ ...metadata, type: 'boolean' }}
        getAndSet={[
          () => getOptionGroup().enabled ?? false,
          (value) => {
            const obj = getOptionGroup();
            obj.enabled = value as boolean;
            setOptionGroup({ ...obj });
          },
        ]}
      />

      {getOptionGroup().enabled && (
        <div className={'padded'}>
          <OptionGroupPanel
            metadata={metadata}
            getAndSet={[
              () => getOptionGroup(),
              setOptionGroup as (value: OptionGroup) => void,
            ]}
          />
        </div>
      )}
    </div>
  );
};
