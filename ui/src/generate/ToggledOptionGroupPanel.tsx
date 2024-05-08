import React from 'react';
import {
  OptionGroup,
  ToggledOptionGroup,
  ToggledOptionGroupMetadata,
} from './models';
import { OptionGroupPanel } from './OptionGroupPanel';

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
      {metadata.name}
      {!radioButtonName && (
        <input
          type={'checkbox'}
          checked={getOptionGroup().enabled ?? false}
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
          checked={getOptionGroup().enabled ?? false}
          onChange={(event) => {
            if (disableAll) disableAll();
            const obj = getOptionGroup();
            obj.enabled = event.target.checked;
            setOptionGroup({ ...obj });
          }}
        />
      )}

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
