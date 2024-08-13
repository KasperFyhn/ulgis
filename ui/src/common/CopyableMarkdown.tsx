import React, { useRef, useState } from 'react';
import Markdown from 'react-markdown';

export interface CopyableMarkdownProps {
  text: string;
}

export const CopyableMarkdown: React.FC<CopyableMarkdownProps> = ({
  text,
}: CopyableMarkdownProps) => {
  const markdownRef = useRef<HTMLDivElement>(null);

  const [responseCopied, setResponseCopied] = useState(false);
  const onCopy = async (): Promise<void> => {
    if (!markdownRef.current || !text) return;

    const html = markdownRef.current.innerHTML;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          // copying both should let rich text editors take the formatted text
          // and plain text editors take the plain text
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ]);
      setResponseCopied(true);
      setTimeout(() => setResponseCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div ref={markdownRef}>
      <button
        className={
          'button visually-disabled button--icon--hide-label ' +
          'button--icon button--text ' +
          (responseCopied ? 'icon-confirm' : 'icon-copy')
        }
        style={{
          float: 'right',
        }}
        onClick={onCopy}
      />
      <Markdown>{text}</Markdown>
    </div>
  );
};
