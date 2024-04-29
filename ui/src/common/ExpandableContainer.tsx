import React, {useState} from "react";
import './ExpandableContainer.css'

export interface ExpandableContainerProps extends React.PropsWithChildren {
    header?: React.ReactElement;
    className?: string;
}

export const ExpandableContainer: React.FC<ExpandableContainerProps> = ({ children, header, className }) => {
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded(!expanded);

    const renderHeader = () => {
        if (header) {
            return React.cloneElement(header, {
                onClick: toggleExpanded,
                style: { cursor: 'default', display: 'inline' }
            }, <>
                {expanded ? <>&#9660; </> : <>&#9658; </>}
                {header.props.children}
            </>);
        } else {
            return (
                <button className="expander-button" onClick={toggleExpanded}>
                    {expanded ? <>&#9660;</> : <>&#9658;</>}
                </button>
            );
        }
    };

    return <div className={className}>
        {renderHeader()}
        {expanded && children}
    </div>;
};