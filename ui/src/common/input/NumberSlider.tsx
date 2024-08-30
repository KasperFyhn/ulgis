import React from 'react';

interface NumberSliderProps {
  min: number;
  max: number;
  step: number;
  getAndSet: [() => number, (value: number) => void];
}

export const NumberSlider: React.FC<NumberSliderProps> = ({
  min,
  max,
  step,
  getAndSet,
}: NumberSliderProps) => {
  const [get, set] = getAndSet;
  const maxDigits = max?.toString().length;
  return (
    <div className={'flex-container--horiz'}>
      <input
        type={'range'}
        value={get()}
        min={min}
        max={max}
        step={step}
        onChange={(event) => set(Number(event.target.value))}
      />
      <div className={'current-value'} style={{ width: `${maxDigits}ch` }}>
        {get()}
      </div>
    </div>
  );
};
