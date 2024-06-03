import React from 'react';
import './ToggleButton.scss';
import { TooltipWrap } from './HelpTooltip';

interface ToggleButtonProps extends React.PropsWithChildren {
  checked: boolean;
  onChange?: (value: boolean) => void;
  tooltipText?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  tooltipText,
  children,
  onChange,
}: ToggleButtonProps) => {
  const button = (
    <button
      className={`${checked ? '' : 'button--dimmed'}`}
      onClick={() => {
        if (onChange) onChange(!checked);
      }}
    >
      {children}
    </button>
  );

  return button;
};
