import 'react-tooltip/dist/react-tooltip.css';
import './HelpTooltip.css';
import { Tooltip } from 'react-tooltip';
import React from 'react';

export interface HelpTooltipProps {
  tooltipId: string;
  content: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  tooltipId,
  content,
}: HelpTooltipProps) => {
  return (
    <span className={'circled-question-mark'} data-tooltip-id={tooltipId}>
      ?
      <Tooltip id={tooltipId} delayShow={500} style={{ maxWidth: '400px' }}>
        {content}
      </Tooltip>
    </span>
  );
};
