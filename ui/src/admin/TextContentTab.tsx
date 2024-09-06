import React, { useContext, useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { TextField } from '../common/input/TextField';
import { AuthContext } from './AuthProvider';

interface TextContentItem {
  name: string;
  text: string;
}

interface TextContentEditorProps {
  textContent: TextContentItem;
  onSuccessfulSubmit?: () => void;
  onFailedSubmit?: () => void;
}

const TextContentEditor: React.FC<TextContentEditorProps> = ({
  textContent,
  onSuccessfulSubmit,
  onFailedSubmit,
}) => {
  const { token } = useContext(AuthContext);

  const [text, setText] = useState(textContent.text);

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
            fetch(process.env.REACT_APP_BACKEND_URL + '/data/text_content', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
              },
              body: JSON.stringify({ name: textContent.name, text: text }),
            }).then((r) => {
              if (r.ok && onSuccessfulSubmit) {
                onSuccessfulSubmit();
              } else if (onFailedSubmit) {
                onFailedSubmit();
              }
            });
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

  const fetchData = () => {
    fetch(process.env.REACT_APP_BACKEND_URL + '/data/text_content')
      .then((response) => response.json())
      .then((data) => setExisting(data));
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
