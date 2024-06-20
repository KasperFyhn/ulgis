import React, { PropsWithChildren, useEffect, useState } from 'react';
import { DefaultTextContentService } from '../TextContentService';
import './Notification.scss';

export type ToasterType = 'neutral' | 'warning' | 'attention' | 'confirm';

export interface NotificationProps extends PropsWithChildren {
  type?: ToasterType;
  fetchKey?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  children,
  type,
  fetchKey,
}: NotificationProps) => {
  if (children !== undefined && fetchKey !== undefined) {
    throw Error('Use only fetch key or children for a notification!');
  }

  const [show, setShow] = useState(true);
  const [content, setContent] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (fetchKey && content === undefined) {
      new DefaultTextContentService().get(fetchKey).then((text) => {
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
        style={{}}
      >
        <div className={'notification__content'}>{content || children}</div>
        <button
          className={
            'button--small button--icon button--icon--hide-label icon-close ' +
            'close-button'
          }
          onClick={() => setShow(false)}
        />
      </div>
    );
  } else {
    return null;
  }
};
