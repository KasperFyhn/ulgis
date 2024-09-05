import React, { useEffect, useLayoutEffect, useRef } from 'react';

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
  useEffect((): void => {
    if (textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight + 2}px`;
    }
  }, [value]);

  if (short) {
    return (
      <div className={'flex-container--vert'}>
        <input
          type={'text'}
          maxLength={80}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          autoFocus={onKeyDown !== undefined}
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
