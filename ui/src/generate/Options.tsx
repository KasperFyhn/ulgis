import React, { useRef } from 'react';
import { NumberOptionMetadata, OptionMetadata, OptionType } from './models';
import './Options.css';
import { ToggleButton } from '../common/ToggleButton';
import 'react-tooltip/dist/react-tooltip.css';
import { MultiValueToggle } from '../common/MultiValueToggle';

interface BooleanToggleProps {
  text: string;
  tooltipText?: string;
  getAndSet: [() => boolean, (value: boolean) => void];
}

const BooleanToggle: React.FC<BooleanToggleProps> = ({
  text,
  tooltipText,
  getAndSet,
}: BooleanToggleProps) => {
  const [get, set] = getAndSet;
  return (
    <ToggleButton
      checked={get()}
      onChange={(value) => set(value)}
      tooltipText={tooltipText}
    >
      {text}
    </ToggleButton>
  );
};

interface StringOptionsProps {
  name: string;
  options: string[];
  getAndSet: [() => string, (value: string) => void];
}

const StringOptions: React.FC<StringOptionsProps> = ({
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

interface NestedStringOptionsProps {
  name: string;
  nestedOptions: { [key: string]: string[] };
  getAndSet: [() => string, (value: string) => void];
}

const NestedStringOptions: React.FC<NestedStringOptionsProps> = ({
  name,
  nestedOptions,
  getAndSet,
}: NestedStringOptionsProps) => {
  const [get, set] = getAndSet;
  return (
    <div className={'flex-container--horiz small-vert-margin'}>
      {Object.entries(nestedOptions).map(([optionName, options]) => {
        return (
          <div key={optionName}>
            {optionName}
            {options.map((option) => (
              <div key={option}>
                <input
                  type={'radio'}
                  name={name}
                  checked={get() === option + ' (' + optionName + ')'}
                  onChange={() => set(option + ' (' + optionName + ')')}
                />
                <label>{option}</label>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

interface MultipleStringOptionsProps {
  options: string[];
  getAndSet: [() => string[], (value: string[]) => void];
}

const MultipleStringOptions: React.FC<MultipleStringOptionsProps> = ({
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

interface TextFieldProps {
  short: boolean;
  getAndSet: [() => string, (value: string) => void];
}

const TextField: React.FC<TextFieldProps> = ({
  short,
  getAndSet,
}: TextFieldProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [get, set] = getAndSet;
  if (short) {
    return (
      <input
        type={'text'}
        maxLength={50}
        value={get()}
        onChange={(event) => set(event.target.value)}
      />
    );
  } else {
    return (
      <div className={'flex-container--vert'}>
        <textarea
          ref={textareaRef}
          value={get()}
          onChange={(event) => {
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto'; // Reset height
              const scrollHeight = textareaRef.current.scrollHeight;
              textareaRef.current.style.height = `${scrollHeight}px`;
            }
            set(event.target.value);
          }}
        />
      </div>
    );
  }
};

interface MultipleTextFieldsProps {
  getAndSet: [() => string[], (value: string[]) => void];
}

const MultipleTextFields: React.FC<MultipleTextFieldsProps> = ({
  getAndSet,
}: MultipleTextFieldsProps) => {
  const [get, set] = getAndSet;
  return (
    <div className={'flex-container--vert'}>
      {get().map((v, i) => (
        <textarea
          key={i}
          value={v}
          onChange={(event) => {
            const textFields = get();
            textFields[i] = event.target.value;
            set([...textFields]);
          }}
        />
      ))}
      <button onClick={() => set([...get(), ''])}>+</button>
    </div>
  );
};

interface StepSliderProps {
  steps: string[];
  getAndSet: [() => number, (value: number) => void];
}

const StepSlider: React.FC<StepSliderProps> = ({
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

interface NumberSliderProps {
  metadata: NumberOptionMetadata;
  getAndSet: [() => number, (value: number) => void];
}

const NumberSlider: React.FC<NumberSliderProps> = ({
  metadata,
  getAndSet,
}: NumberSliderProps) => {
  const [get, set] = getAndSet;
  const maxDigits = metadata.max?.toString().length;
  return (
    <div className={'flex-container--horiz'}>
      <input
        type={'range'}
        value={get()}
        min={metadata.min}
        max={metadata.max}
        step={metadata.step}
        onChange={(event) => set(Number(event.target.value))}
      />
      <div className={'current-value'} style={{ width: `${maxDigits}ch` }}>
        {get()}
      </div>
    </div>
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
        if (Array.isArray(metadata.options)) {
          return (
            <StringOptions
              name={metadata.name}
              options={metadata.options}
              getAndSet={getAndSet as [() => string, (value: string) => void]}
            />
          );
        } else {
          return (
            <NestedStringOptions
              name={metadata.name}
              nestedOptions={metadata.options}
              getAndSet={getAndSet as [() => string, (value: string) => void]}
            />
          );
        }
      } else {
        return (
          <TextField
            short={metadata.short ?? false}
            getAndSet={getAndSet as [() => string, (value: string) => void]}
          />
        );
      }
    case 'stringArray':
      if (metadata.options) {
        return (
          <MultipleStringOptions
            options={metadata.options}
            getAndSet={getAndSet as [() => string[], (value: string[]) => void]}
          />
        );
      } else {
        return (
          <MultipleTextFields
            getAndSet={getAndSet as [() => string[], (value: string[]) => void]}
          />
        );
      }
    case 'number':
      if (metadata.steps) {
        return (
          <StepSlider
            steps={metadata.steps}
            getAndSet={getAndSet as [() => number, (value: number) => void]}
          />
        );
      }
      return (
        <NumberSlider
          metadata={metadata}
          getAndSet={getAndSet as [() => number, (value: number) => void]}
        />
      );

    default:
      return <div>Unknown input</div>;
  }
};
