import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import React, { ReactElement } from 'react';

export interface TooltipProps {
  tooltipId: string;
  content?: string;
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
  if (!content) {
    return <>{children}</>;
  }
  return (
    <>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as ReactElement, {
          'data-tooltip-id': tooltipId,
        }),
      )}
      <Tooltip
        id={tooltipId}
        delayShow={delayShow ?? 600}
        // CSS classes do not work as expected; therefore directly in style
        style={{
          maxWidth: '400px',
          fontSize: '14px',
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
  if (!content) {
    return null;
  }
  return (
    <TooltipWrap tooltipId={tooltipId} content={content} delayShow={200}>
      <span className={'tooltip'} />
    </TooltipWrap>
  );
};
