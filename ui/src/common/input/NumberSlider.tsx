import React from 'react';

interface NumberSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  setValue: (value: number) => void;
}

export const NumberSlider: React.FC<NumberSliderProps> = ({
  min,
  max,
  step,
  value,
  setValue,
}: NumberSliderProps) => {
  const maxDigits = max?.toString().length;
  return (
    <div className={'flex-container--horiz'}>
      <input
        type={'range'}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => setValue(Number(event.target.value))}
      />
      <div className={'current-value'} style={{ width: `${maxDigits}ch` }}>
        {value}
      </div>
    </div>
  );
};
