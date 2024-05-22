import React from 'react';
import './MultiValueToggle.css';

export interface MultiValueToggleProps {
  selected: string;
  onChange: (value: string) => void;
  options: string[];
}

export const MultiValueToggle = ({
  selected,
  onChange,
  options,
}: MultiValueToggleProps) => {
  return (
    <div className="multi-value-toggle">
      {options.map((option) => (
        <div key={option}>
          <input
            type="radio"
            name={options.join('_')}
            id={option}
            checked={option === selected}
            onChange={() => onChange(option)}
          />
          <label htmlFor={option}>{option}</label>
        </div>
      ))}
    </div>
  );
};
