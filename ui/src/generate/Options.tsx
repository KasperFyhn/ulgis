import React from 'react';
import { OptionMetadata, OptionType } from './models';
import './Options.css';
import { BooleanToggle } from '../common/input/BooleanToggle';
import { StringOptions } from '../common/input/StringOptions';
import { MultipleStringOptions } from '../common/input/MultipleStringOptions';
import { TextField } from '../common/input/TextField';
import { MultipleTextFields } from '../common/input/MultipleTextFields';
import { StepSlider } from '../common/input/StepSlider';
import { NumberSlider } from '../common/input/NumberSlider';
import { HelpTooltip } from '../common/HelpTooltip';

interface OptionsHeaderProps {
  metadata: OptionMetadata;
}

const OptionsHeader: React.FC<OptionsHeaderProps> = ({ metadata }) => {
  return (
    <span>
      {metadata.name}
      <HelpTooltip tooltipId={metadata.name} content={metadata.description} />
    </span>
  );
};

interface OptionsProps<T extends OptionType> {
  metadata: OptionMetadata;
  getAndSet: [() => T, (value: T) => void];
}

export const Options: React.FC<OptionsProps<OptionType>> = ({
  metadata,
  getAndSet,
}: OptionsProps<OptionType>) => {
  switch (metadata.type) {
    case 'boolean':
      return (
        <BooleanToggle
          text={metadata.name}
          tooltipText={metadata.description}
          getAndSet={getAndSet as [() => boolean, (value: boolean) => void]}
        />
      );
    case 'string':
      if (metadata.options) {
        return (
          <>
            <OptionsHeader metadata={metadata} />
            <StringOptions
              name={metadata.name}
              options={metadata.options}
              getAndSet={getAndSet as [() => string, (value: string) => void]}
            />
          </>
        );
      } else {
        return (
          <>
            <OptionsHeader metadata={metadata} />{' '}
            <TextField
              short={metadata.short}
              getAndSet={getAndSet as [() => string, (value: string) => void]}
            />
          </>
        );
      }
    case 'stringArray':
      if (metadata.options) {
        return (
          <>
            <OptionsHeader metadata={metadata} />{' '}
            <MultipleStringOptions
              options={metadata.options}
              getAndSet={
                getAndSet as [() => string[], (value: string[]) => void]
              }
            />
          </>
        );
      } else {
        return (
          <>
            <OptionsHeader metadata={metadata} />{' '}
            <MultipleTextFields
              short={metadata.short}
              getAndSet={
                getAndSet as [() => string[], (value: string[]) => void]
              }
            />
          </>
        );
      }
    case 'number':
      if (metadata.steps) {
        return (
          <>
            <OptionsHeader metadata={metadata} />
            <StepSlider
              steps={metadata.steps}
              getAndSet={getAndSet as [() => number, (value: number) => void]}
            />
          </>
        );
      } else if (metadata.min !== undefined && metadata.max !== undefined) {
        return (
          <>
            <OptionsHeader metadata={metadata} />
            <NumberSlider
              min={metadata.min}
              max={metadata.max}
              step={metadata.step ?? 1}
              getAndSet={getAndSet as [() => number, (value: number) => void]}
            />
          </>
        );
      } else {
        throw Error(
          'A number input must have either steps or min, max and step!',
        );
      }

    default:
      return <div>Unknown input</div>;
  }
};
