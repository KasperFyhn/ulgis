import React from 'react';
import { ToggleButton } from './ToggleButton';

interface MultipleStringOptionsProps {
  options: string[];
  getAndSet: [() => string[], (value: string[]) => void];
}

export const MultipleStringOptions: React.FC<MultipleStringOptionsProps> = ({
  options,
  getAndSet,
}: MultipleStringOptionsProps) => {
  const [get, set] = getAndSet;
  return (
    <div className={'flex-container--horiz'}>
      {options.map((option) => (
        <span key={option}>
          <ToggleButton
            checked={option in get()}
            onChange={(value) => {
              let picked = get();
              if (value) {
                picked.push(option);
              } else {
                picked = picked.filter((o) => o !== option);
              }
              set([...picked]);
            }}
          ></ToggleButton>
          {option}
        </span>
      ))}
    </div>
  );
};
