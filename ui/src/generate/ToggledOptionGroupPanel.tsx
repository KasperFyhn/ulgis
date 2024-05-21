import React from 'react';
import {
  isEmptyOptionGroup,
  OptionGroup,
  ToggledOptionGroup,
  ToggledOptionGroupMetadata,
} from './models';
import { OptionGroupPanel } from './OptionGroupPanel';
import { ToggleButton } from '../common/ToggleButton';

export interface ToggledOptionGroupPanelProps {
  metadata: ToggledOptionGroupMetadata;
  disableAll?: () => void;
  getAndSet: [() => ToggledOptionGroup, (value: ToggledOptionGroup) => void];
  equalSize?: boolean;
}

export const ToggledOptionGroupPanel: React.FC<
  ToggledOptionGroupPanelProps
> = ({
  metadata,
  disableAll,
  getAndSet,
  equalSize,
}: ToggledOptionGroupPanelProps) => {
  const [getOptionGroup, setOptionGroup] = getAndSet;
  return (
    <div
      className={
        equalSize ? 'flex-container__box--equal-size' : 'flex-container__box'
      }
    >
      <ToggleButton
        checked={getOptionGroup().enabled}
        onChange={(value) => {
          if (disableAll && !value) return;
          if (disableAll) disableAll();
          const obj = getOptionGroup();
          obj.enabled = value;
          setOptionGroup({ ...obj });
        }}
        tooltipText={metadata.description}
      >
        {metadata.name}
      </ToggleButton>

      {getOptionGroup().enabled && !isEmptyOptionGroup(getOptionGroup()) && (
        <div className={'group'}>
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
