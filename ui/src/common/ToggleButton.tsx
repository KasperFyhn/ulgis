import React, { CSSProperties } from 'react';
import './ToggleButton.scss';

interface ToggleButtonProps extends React.PropsWithChildren {
  checked: boolean;
  onChange?: (value: boolean) => void;
  style?: CSSProperties;
  className?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  children,
  onChange,
  style,
  className,
}: ToggleButtonProps) => {
  return (
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
};
