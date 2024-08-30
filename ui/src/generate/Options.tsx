import React, { useEffect, useRef } from 'react';
import { NumberOptionMetadata, OptionMetadata, OptionType } from './models';
import './Options.css';
import { ToggleButton } from '../common/ToggleButton';
import { MultiValueToggle } from '../common/MultiValueToggle';
import { TooltipWrap } from '../common/HelpTooltip';

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
    <TooltipWrap tooltipId={text} content={tooltipText}>
      <ToggleButton checked={get()} onChange={(value) => set(value)}>
        {text}
      </ToggleButton>
    </TooltipWrap>
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
  short?: boolean;
  onKeyDown?: React.KeyboardEventHandler;
  getAndSet: [() => string, (value: string) => void];
}

export const TextField: React.FC<TextFieldProps> = ({
  short,
  onKeyDown,
  getAndSet,
}: TextFieldProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight + 2}px`;
    }
  };

  useEffect(autoSetHeight);

  const [get, set] = getAndSet;
  if (short) {
    return (
      <div className={'flex-container--vert'}>
        <input
          type={'text'}
          maxLength={50}
          value={get()}
          onChange={(event) => set(event.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
      </div>
    );
  } else {
    return (
      <div className={'flex-container--vert'}>
        <textarea
          ref={textareaRef}
          value={get()}
          onChange={(event) => {
            autoSetHeight();
            set(event.target.value);
          }}
          onKeyDown={onKeyDown}
          autoFocus={onKeyDown !== undefined}
        />
      </div>
    );
  }
};

interface MultipleTextFieldsProps {
  short?: boolean;
  getAndSet: [() => string[], (value: string[]) => void];
}

const MultipleTextFields: React.FC<MultipleTextFieldsProps> = ({
  short,
  getAndSet,
}: MultipleTextFieldsProps) => {
  const [get, set] = getAndSet;

  return (
    <div className={'flex-container--vert'}>
      {get().map((_, i) => (
        <TextField
          key={i}
          short={short}
          getAndSet={[
            () => get()[i],
            (value) => {
              const textFields = get();
              textFields[i] = value;
              set([...textFields]);
            },
          ]}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              get().every((element) => element !== '')
            ) {
              set([...get(), '']);
            }
          }}
        />
      ))}
      <button
        onClick={() => set([...get(), ''])}
        disabled={get().some((v) => v === '')}
        className={
          'button--icon button--icon--hide-label icon-add visually-disabled'
        }
      />
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
            short={metadata.short}
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
            short={metadata.short}
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
