import React from 'react';

export const ExternalLink: React.FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> = (props) => {
  return (
    <a {...props} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
};
