import React, { useContext, useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { TextField } from '../common/input/TextField';
import { AuthContext } from './AuthProvider';
import HasDbSubmission from './HasDbSubmission';
import {
  getTextContentService,
  TextContentItem,
} from '../service/TextContentService';

interface TextContentEditorProps extends HasDbSubmission {
  textContent: TextContentItem;
}

const TextContentEditor: React.FC<TextContentEditorProps> = ({
  textContent,
  onSuccessfulSubmit,
  onFailedSubmit,
}) => {
  const { token } = useContext(AuthContext);

  const [text, setText] = useState(textContent.text);

  if (token === null) {
    return null;
  }

  return (
    <div className={'content-pane padded'} key={textContent.name}>
      <h1>{textContent.name}</h1>
      <div className={'flex-container--horiz'} style={{ gap: '50px' }}>
        <div className={'flex-container__box--equal-size'}>
          <h2>Editor</h2>
          <TextField value={text} setValue={(value) => setText(value)} />
        </div>
        <div className={'flex-container__box--equal-size'}>
          <h2>Preview</h2>
          <Markdown>{text}</Markdown>
        </div>
      </div>
      <div className={'button-container'}>
        <button
          className={'visually-disabled'}
          disabled={textContent.text === text}
          onClick={() => {
            getTextContentService()
              .put(textContent.name, text, token)
              .then(onSuccessfulSubmit, onFailedSubmit);
          }}
        >
          Save changes
        </button>
      </div>
    </div>
  );
};

export const TextContentTab: React.FC = () => {
  const [existing, setExisting] = useState<TextContentItem[]>([]);

  const fetchData = (): void => {
    console.log('here');
    getTextContentService().getAll().then(setExisting);
  };

  useEffect(() => {
    if (existing.length === 0) {
      fetchData();
    }
  }, [existing.length]);

  return (
    <div className={'flex-container--vert'}>
      {existing.map((textContent) => (
        <TextContentEditor
          textContent={textContent}
          key={textContent.name}
          onSuccessfulSubmit={fetchData}
          onFailedSubmit={() => alert('Submission failed!')}
        />
      ))}
    </div>
  );
};
