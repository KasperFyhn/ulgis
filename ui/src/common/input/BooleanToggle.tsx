import React from 'react';
import { HelpTooltip, TooltipWrap } from '../HelpTooltip';
import { ToggleButton } from './ToggleButton';

interface BooleanToggleProps {
  text: string;
  tooltipText?: string;
  value: boolean;
  setValue: (value: boolean) => void;
  checkMarkButton?: boolean;
}

export const BooleanToggle: React.FC<BooleanToggleProps> = ({
  text,
  tooltipText,
  value,
  setValue,
  checkMarkButton,
}: BooleanToggleProps) => {
  if (checkMarkButton) {
    return (
      <span>
        <ToggleButton
          className={
            'button button--small button--icon button--text ' +
            'button--icon--hide-label ' +
            (value ? 'icon-confirm' : 'icon-failed')
          }
          checked={value}
          onChange={(v) => setValue(v)}
        />
        {' ' + text}
        <HelpTooltip tooltipId={text} content={tooltipText} />
      </span>
    );
  } else {
    return (
      <TooltipWrap tooltipId={text} content={tooltipText}>
        <ToggleButton checked={value} onChange={(v) => setValue(v)}>
          {text}
        </ToggleButton>
        )
      </TooltipWrap>
    );
  }
};
