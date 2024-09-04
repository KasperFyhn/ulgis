import React from 'react';
import { MultiValueToggle } from './MultiValueToggle';

export interface StringOptionsProps {
  name: string;
  options: string[];
  value: string;
  setValue: (value: string) => void;
}

export const StringOptions: React.FC<StringOptionsProps> = ({
  name,
  options,
  value,
  setValue,
}: StringOptionsProps) => {
  if (options.length < 10) {
    return (
      <div className={'small-vert-margin'}>
        <MultiValueToggle
          name={name}
          selected={value}
          onChange={setValue}
          options={options}
        />
      </div>
    );
  }
  return (
    <div className={'small-vert-margin'}>
      {options.map((option) => (
        <div key={option}>
          <input
            type={'radio'}
            name={name}
            checked={value === option}
            onChange={() => setValue(option)}
          />
          <label>{option}</label>
        </div>
      ))}
    </div>
  );
};
