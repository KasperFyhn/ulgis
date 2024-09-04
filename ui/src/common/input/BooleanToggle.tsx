import React from 'react';
import { TooltipWrap } from '../HelpTooltip';
import { ToggleButton } from './ToggleButton';

interface BooleanToggleProps {
  text: string;
  tooltipText?: string;
  value: boolean;
  setValue: (value: boolean) => void;
}

export const BooleanToggle: React.FC<BooleanToggleProps> = ({
  text,
  tooltipText,
  value,
  setValue,
}: BooleanToggleProps) => {
  return (
    <TooltipWrap tooltipId={text} content={tooltipText}>
      <ToggleButton checked={value} onChange={(v) => setValue(v)}>
        {text}
      </ToggleButton>
    </TooltipWrap>
  );
};
