import React from 'react';

interface StepSliderProps {
  steps: string[];
  getAndSet: [() => number, (value: number) => void];
}

export const StepSlider: React.FC<StepSliderProps> = ({
  steps,
  getAndSet,
}: StepSliderProps) => {
  const [get, set] = getAndSet;
  const [beingChanged, setBeingChanged] = React.useState<boolean>(false);
  return (
    <div className={'flex-container--horiz'}>
      <input
        type={'range'}
        value={get()}
        min={0}
        max={steps.length - 1}
        step={1}
        onChange={(event) => set(Number(event.target.value))}
        onMouseDown={() => setBeingChanged(true)}
        onMouseUp={() => setBeingChanged(false)}
      />
      {beingChanged && (
        <div className={'current-value__hovering'} style={{}}>
          {steps[get()]}
        </div>
      )}
    </div>
  );
};
