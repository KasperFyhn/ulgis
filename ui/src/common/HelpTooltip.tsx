import 'react-tooltip/dist/react-tooltip.css';
import './HelpTooltip.css';
import { Tooltip } from 'react-tooltip';
import React from 'react';

export interface TooltipProps {
  tooltipId: string;
  content: string;
  delayShow?: number;
}

export interface TooltipWrapProps
  extends TooltipProps,
    React.PropsWithChildren {}

export const TooltipWrap: React.FC<TooltipWrapProps> = ({
  tooltipId,
  content,
  delayShow,
  children,
}: TooltipWrapProps) => {
  return (
    <>
      <span data-tooltip-id={tooltipId}>{children}</span>
      <Tooltip
        id={tooltipId}
        delayShow={delayShow ?? 750}
        // CSS classes seem not work as expected; therefore directly in style
        style={{
          maxWidth: '400px',
          fontSize: '12px',
          zIndex: '20', // should stay on top
        }}
      >
        {content}
      </Tooltip>
    </>
  );
};

export const HelpTooltip: React.FC<TooltipProps> = ({
  tooltipId,
  content,
}: TooltipProps) => {
  return (
    <TooltipWrap tooltipId={tooltipId} content={content} delayShow={200}>
      <span className={'circled-question-mark'}>?</span>
    </TooltipWrap>
  );
};
