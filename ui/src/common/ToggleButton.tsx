import React, { useState } from 'react';
import './ToggleButton.css';
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
      className={`toggle-button ${checked ? 'toggled' : ''}`}
      onClick={() => {
        if (onChange) onChange(!checked);
      }}
    >
      {children}
    </button>
  );
  if (tooltipText) {
    return (
      <TooltipWrap tooltipId={tooltipText} content={tooltipText}>
        {button}
      </TooltipWrap>
    );
  } else {
    return button;
  }
};
