import React, { useRef } from 'react';

interface TextFieldProps {
  short?: boolean;
  onKeyDown?: React.KeyboardEventHandler;
  value: string;
  setValue: (value: string) => void;
}

export const TextField: React.FC<TextFieldProps> = ({
  short,
  onKeyDown,
  value,
  setValue,
}: TextFieldProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  if (short) {
    return (
      <div className={'flex-container--vert'}>
        <input
          type={'text'}
          maxLength={50}
          value={value}
          onChange={(event) => setValue(event.target.value)}
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
          value={value}
          onChange={(event) => {
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto'; // Reset height
              const scrollHeight = textareaRef.current.scrollHeight;
              textareaRef.current.style.height = `${scrollHeight + 2}px`;
            }
            if (event.target.value === '\n') return; // caused annoying issues
            setValue(event.target.value);
          }}
          onKeyDown={onKeyDown}
          autoFocus={onKeyDown !== undefined}
        />
      </div>
    );
  }
};
