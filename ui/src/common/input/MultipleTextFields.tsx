import React from 'react';
import { TextField } from './TextField';

interface MultipleTextFieldsProps {
  short?: boolean;
  value: string[];
  setValue: (value: string[]) => void;
}

export const MultipleTextFields: React.FC<MultipleTextFieldsProps> = ({
  short,
  value,
  setValue,
}: MultipleTextFieldsProps) => {
  return (
    <div className={'flex-container--vert'}>
      {value.map((_, i) => (
        <TextField
          key={i}
          short={short}
          value={value[i]}
          setValue={(v) => {
            value[i] = v;
            setValue([...value]);
          }}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              value.every((element) => element !== '')
            ) {
              setValue([...value, '']);
            }
          }}
        />
      ))}
      <button
        onClick={() => setValue([...value, ''])}
        disabled={value.some((v) => v === '')}
        className={
          'button--icon button--icon--hide-label icon-add visually-disabled'
        }
      />
    </div>
  );
};
