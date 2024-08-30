import React, { useEffect, useState } from 'react';
import { TextField } from '../generate/Options';
import Markdown from 'react-markdown';

interface TextContentItem {
  name: string;
  text: string;
}

interface TextContentEditorProps {
  textContent: TextContentItem;
}

const TextContentEditor: React.FC<TextContentEditorProps> = ({
  textContent,
}) => {
  const [text, setText] = useState(textContent.text);

  return (
    <div className={'content-pane padded'} key={textContent.name}>
      <h1>{textContent.name}</h1>
      <div className={'flex-container--horiz'} style={{ gap: '50px' }}>
        <div className={'flex-container__box--equal-size'}>
          <h2>Editor</h2>
          <TextField getAndSet={[() => text, (value) => setText(value)]} />
        </div>
        <div className={'flex-container__box--equal-size'}>
          <h2>Preview</h2>
          <Markdown>{text}</Markdown>
        </div>
      </div>
    </div>
  );
};

export const TextContentTab: React.FC = () => {
  const [existing, setExisting] = useState<TextContentItem[]>([]);

  useEffect(() => {
    if (existing.length === 0) {
      fetch(process.env.REACT_APP_BACKEND_URL + '/data/text_content')
        .then((response) => response.json())
        .then((data) => setExisting(data));
    }
  });

  return (
    <div className={'flex-container--vert'}>
      {existing.map((textContent) => (
        <TextContentEditor textContent={textContent} key={textContent.name} />
      ))}
    </div>
  );
};
