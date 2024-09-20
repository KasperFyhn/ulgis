import React, { PropsWithChildren, useEffect, useState } from 'react';
import { getTextContentService } from '../service/TextContentService';
import './Notification.scss';
import Markdown from 'react-markdown';

export type ToasterType = 'neutral' | 'warning' | 'attention' | 'confirm';

export interface NotificationProps extends PropsWithChildren {
  type?: ToasterType;
  fetchKey?: string;
  onDismiss?: () => void;
  nonDismissible?: boolean;
}

export const Notification: React.FC<NotificationProps> = ({
  children,
  type,
  fetchKey,
  onDismiss,
  nonDismissible,
}: NotificationProps) => {
  if (children !== undefined && fetchKey !== undefined) {
    throw Error('Use only fetch key or children for a notification!');
  }

  const [show, setShow] = useState(true);
  const [content, setContent] = useState<string | undefined>(undefined);

  useEffect(() => {
    setShow(true);
  }, [children, fetchKey]);

  useEffect(() => {
    if (fetchKey && content === undefined) {
      getTextContentService()
        .get(fetchKey)
        .then((text) => {
          setContent(text);
        });
    }
  });

  if (type === undefined) {
    type = 'neutral';
  }

  if (show) {
    return (
      <div
        className={
          'notification-container notification--vertical-margin notification ' +
          'soft-shadow notification--' +
          type
        }
      >
        <div className={'notification__content'}>
          {(content && (
            <Markdown className={'notification__markdown'}>{content}</Markdown>
          )) ||
            children}
        </div>
        {!nonDismissible && (
          <button
            className={
              'button--small button--icon button--icon--hide-label ' +
              'icon-close close-button'
            }
            onClick={() => {
              setShow(false);
              if (onDismiss) onDismiss();
            }}
          />
        )}
      </div>
    );
  } else {
    return null;
  }
};
