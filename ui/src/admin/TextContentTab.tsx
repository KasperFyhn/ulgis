import React, { useContext, useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { TextField } from '../common/input/TextField';
import { AuthContext } from './AuthProvider';
import HasDbSubmission from './HasDbSubmission';
import {
  getTextContentService,
  TextContentItem,
} from '../service/TextContentService';
import { Notification } from '../common/Notification';
import { Link } from 'react-router-dom';
import { ExternalLink } from '../common/ExternalLink';

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
          <Markdown components={{ a: ExternalLink }}>{text}</Markdown>
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
    getTextContentService().getAll().then(setExisting);
  };

  useEffect(() => {
    if (existing.length === 0) {
      fetchData();
    }
  }, [existing.length]);

  return (
    <div className={'flex-container--vert'}>
      <Notification type={'confirm'}>
        Text contents support{' '}
        <Link
          className={'a--text-link'}
          to={'https://www.markdownguide.org/basic-syntax/'}
          target={'_blank'}
        >
          Markdown formatting <span className={'icon icon-link-external'} />
        </Link>
      </Notification>
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
