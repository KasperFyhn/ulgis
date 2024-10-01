import React from 'react';

interface StepSliderProps {
  steps: string[];
  value: number;
  setValue: (value: number) => void;
  disabled?: boolean;
}

export const StepSlider: React.FC<StepSliderProps> = ({
  steps,
  value,
  setValue,
  disabled,
}: StepSliderProps) => {
  const [beingChanged, setBeingChanged] = React.useState<boolean>(false);
  return (
    <div className={'flex-container--horiz'}>
      <input
        type={'range'}
        value={value}
        min={0}
        max={steps.length - 1}
        step={1}
        onChange={(event) => setValue(Number(event.target.value))}
        onMouseDown={() => setBeingChanged(true)}
        onMouseUp={() => setBeingChanged(false)}
        disabled={disabled}
      />
      {beingChanged && (
        <div className={'current-value__hovering'} style={{}}>
          {steps[value]}
        </div>
      )}
    </div>
  );
};
