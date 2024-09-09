import React from 'react';

interface ToggleButtonProps extends React.PropsWithChildren {
  checked: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  children,
  onChange,
  className,
  ...rest
}: ToggleButtonProps) => {
  return (
    <button
      className={`${checked ? '' : 'button--dimmed'} ` + className}
      onClick={() => {
        if (onChange) onChange(!checked);
      }}
      {...rest}
    >
      {children}
    </button>
  );
};
