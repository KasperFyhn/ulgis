import React from 'react';
import './MultiValueToggle.css';

export interface MultiValueToggleProps {
  name: string;
  selected: string;
  onChange: (value: string) => void;
  options: string[];
}

export const MultiValueToggle: React.FC<MultiValueToggleProps> = ({
  name,
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
            name={name}
            id={name + option}
            checked={option === selected}
            onChange={() => onChange(option)}
          />
          <label htmlFor={name + option}>{option}</label>
        </div>
      ))}
    </div>
  );
};
