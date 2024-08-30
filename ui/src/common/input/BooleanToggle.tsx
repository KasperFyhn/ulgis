import React from 'react';
import { TooltipWrap } from '../HelpTooltip';
import { ToggleButton } from './ToggleButton';

interface BooleanToggleProps {
  text: string;
  tooltipText?: string;
  getAndSet: [() => boolean, (value: boolean) => void];
}

export const BooleanToggle: React.FC<BooleanToggleProps> = ({
  text,
  tooltipText,
  getAndSet,
}: BooleanToggleProps) => {
  const [get, set] = getAndSet;
  return (
    <TooltipWrap tooltipId={text} content={tooltipText}>
      <ToggleButton checked={get()} onChange={(value) => set(value)}>
        {text}
      </ToggleButton>
    </TooltipWrap>
  );
};
