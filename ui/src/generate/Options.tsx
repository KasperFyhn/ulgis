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
  value: T;
  setValue: (value: T) => void;
}

export const Options: React.FC<OptionsProps<OptionType>> = ({
  metadata,
  value,
  setValue,
}: OptionsProps<OptionType>) => {
  switch (metadata.type) {
    case 'boolean':
      return (
        <BooleanToggle
          text={metadata.name}
          tooltipText={metadata.description}
          value={value as boolean}
          setValue={(v) => setValue(v)}
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
              value={value as string}
              setValue={(v) => setValue(v)}
            />
          </>
        );
      } else {
        return (
          <>
            <OptionsHeader metadata={metadata} />{' '}
            <TextField
              short={metadata.short}
              value={value as string}
              setValue={setValue}
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
              value={value as string[]}
              setValue={(v) => setValue(v)}
            />
          </>
        );
      } else {
        return (
          <>
            <OptionsHeader metadata={metadata} />{' '}
            <MultipleTextFields
              short={metadata.short}
              value={value as string[]}
              setValue={(v) => setValue(v)}
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
              value={value as number}
              setValue={(v) => setValue(v)}
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
              value={value as number}
              setValue={(v) => setValue(v)}
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
