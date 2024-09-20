import React, { useState } from 'react';

interface DeleteButtonProps extends React.PropsWithChildren {
  onClick: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick }) => {
  const [inputText, setInputText] = useState('');

  return (
    <div className={'flex-container--horiz'}>
      <input
        type={'text'}
        maxLength={10}
        placeholder={'Type "delete"'}
        value={inputText}
        onChange={(event) => setInputText(event.target.value)}
        style={{ maxWidth: '12ch' }}
      />
      <button
        onClick={onClick}
        className={'theme--magenta theme--dark visually-disabled'}
        disabled={inputText.toLowerCase() !== 'delete'}
      >
        Delete
      </button>
    </div>
  );
};
