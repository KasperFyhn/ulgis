import React from 'react';

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
    <fieldset className={'switch switch__content'}>
      <div className=" switch__segments">
        {options.map((option) => {
          const checked = option === selected;
          return (
            <div
              key={option}
              className={'switch__input ' + (checked ? 'switch__checked' : '')}
            >
              <input
                type="radio"
                name={name}
                id={name + option}
                checked={checked}
                onChange={() => onChange(option)}
              />
              <label className={'switch__segment'} htmlFor={name + option}>
                {option}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};
