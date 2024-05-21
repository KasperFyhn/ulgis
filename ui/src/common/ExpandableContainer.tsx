import React, { useState } from 'react';
import './ExpandableContainer.css';

export interface ExpandableContainerProps extends React.PropsWithChildren {
  header?: React.ReactElement;
  startExpanded?: boolean;
  className?: string;
}

export const ExpandableContainer: React.FC<ExpandableContainerProps> = ({
  children,
  header,
  startExpanded,
  className,
}) => {
  const [expanded, setExpanded] = useState(startExpanded === true);
  const toggleExpanded: () => void = () => setExpanded(!expanded);

  const renderHeader: () => React.ReactElement = () => {
    if (header) {
      return React.cloneElement(
        header,
        {
          onClick: toggleExpanded,
          style: { cursor: 'default', display: 'inline-block' },
        },
        <>
          {expanded ? <>&#9660; </> : <>&#9658; </>}
          {header.props.children}
        </>,
      );
    } else {
      return (
        <button className="expander-button" onClick={toggleExpanded}>
          {expanded ? <>&#9660;</> : <>&#9658;</>}
        </button>
      );
    }
  };

  return (
    <div className={className}>
      {renderHeader()}
      {expanded && children}
    </div>
  );
};
