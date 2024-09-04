import React from 'react';
import { ToggleButton } from './ToggleButton';

interface MultipleStringOptionsProps {
  options: string[];
  value: string[];
  setValue: (value: string[]) => void;
}

export const MultipleStringOptions: React.FC<MultipleStringOptionsProps> = ({
  options,
  value,
  setValue,
}: MultipleStringOptionsProps) => {
  return (
    <div className={'flex-container--horiz'}>
      {options.map((option) => (
        <span key={option}>
          <ToggleButton
            checked={option in value}
            onChange={(v) => {
              let picked = value;
              if (v) {
                picked.push(option);
              } else {
                picked = picked.filter((o) => o !== option);
              }
              setValue([...picked]);
            }}
          ></ToggleButton>
          {option}
        </span>
      ))}
    </div>
  );
};
