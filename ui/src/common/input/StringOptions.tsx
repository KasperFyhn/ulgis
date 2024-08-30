import React from 'react';
import { MultiValueToggle } from './MultiValueToggle';

export interface StringOptionsProps {
  name: string;
  options: string[];
  getAndSet: [() => string, (value: string) => void];
}

export const StringOptions: React.FC<StringOptionsProps> = ({
  name,
  options,
  getAndSet,
}: StringOptionsProps) => {
  const [get, set] = getAndSet;
  if (options.length < 10) {
    return (
      <div className={'small-vert-margin'}>
        <MultiValueToggle
          name={name}
          selected={get()}
          onChange={set}
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
            checked={get() === option}
            onChange={() => set(option)}
          />
          <label>{option}</label>
        </div>
      ))}
    </div>
  );
};
