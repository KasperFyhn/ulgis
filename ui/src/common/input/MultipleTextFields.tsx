import React from 'react';
import { TextField } from './TextField';

interface MultipleTextFieldsProps {
  short?: boolean;
  getAndSet: [() => string[], (value: string[]) => void];
}

export const MultipleTextFields: React.FC<MultipleTextFieldsProps> = ({
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
