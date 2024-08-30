import React, { useRef } from 'react';

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
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto'; // Reset height
              const scrollHeight = textareaRef.current.scrollHeight;
              textareaRef.current.style.height = `${scrollHeight + 2}px`;
            }
            set(event.target.value);
          }}
          onKeyDown={onKeyDown}
          autoFocus={onKeyDown !== undefined}
        />
      </div>
    );
  }
};
