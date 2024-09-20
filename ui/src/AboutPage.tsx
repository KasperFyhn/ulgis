import React, { useEffect, useState } from 'react';
import { getTextContentService } from './service/TextContentService';
import Markdown from 'react-markdown';

export const AboutPage = (): React.JSX.Element => {
  const [text, setText] = useState<string>('Loading ...');

  useEffect(() => {
    getTextContentService()
      .get('about')
      .then((result) => setText(result));
  });

  return (
    // Delphinus defines a max width of some 60-70 chars for readability which
    // is why there is a specific max width for this piece of text for now
    <div className={'content-pane padded'} style={{ maxWidth: '70ch' }}>
      <h1>About</h1>
      <Markdown>{text}</Markdown>
    </div>
  );
};
