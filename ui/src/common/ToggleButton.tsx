import React, { CSSProperties } from 'react';
import './ToggleButton.scss';
import { TooltipWrap } from './HelpTooltip';

interface ToggleButtonProps extends React.PropsWithChildren {
  checked: boolean;
  onChange?: (value: boolean) => void;
  tooltipText?: string;
  style?: CSSProperties;
  className?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  tooltipText,
  children,
  onChange,
  style,
  className,
}: ToggleButtonProps) => {
  const button = (
    <button
      style={style}
      className={`${checked ? '' : 'button--dimmed'} ` + className}
      onClick={() => {
        if (onChange) onChange(!checked);
      }}
    >
      {children}
    </button>
  );

  return button;
};
