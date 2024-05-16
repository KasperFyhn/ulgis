import React from 'react';
import {
  isEmptyOptionGroup,
  OptionGroup,
  ToggledOptionGroup,
  ToggledOptionGroupMetadata,
} from './models';
import { OptionGroupPanel } from './OptionGroupPanel';
import { HelpTooltip } from '../common/HelpTooltip';

export interface ToggledOptionGroupPanelProps {
  metadata: ToggledOptionGroupMetadata;
  radioButtonName?: string;
  disableAll?: () => void;
  getAndSet: [() => ToggledOptionGroup, (value: ToggledOptionGroup) => void];
  equalSize?: boolean;
}

export const ToggledOptionGroupPanel: React.FC<
  ToggledOptionGroupPanelProps
> = ({
  metadata,
  radioButtonName,
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
      {!radioButtonName && (
        <input
          type={'checkbox'}
          checked={getOptionGroup().enabled}
          onChange={(event) => {
            const obj = getOptionGroup();
            obj.enabled = event.target.checked;
            setOptionGroup({ ...obj });
          }}
        />
      )}
      {radioButtonName && (
        <input
          type={'radio'}
          name={radioButtonName}
          checked={getOptionGroup().enabled}
          onChange={(event) => {
            if (disableAll) disableAll();
            const obj = getOptionGroup();
            obj.enabled = event.target.checked;
            setOptionGroup({ ...obj });
          }}
        />
      )}
      <span>{metadata.name}</span>
      {metadata.description && (
        <HelpTooltip tooltipId={metadata.name} content={metadata.description} />
      )}
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
