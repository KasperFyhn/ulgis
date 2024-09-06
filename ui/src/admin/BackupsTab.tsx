import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthProvider';
import { DeleteButton } from './DeleteButton';
import { TextField } from '../common/input/TextField';
import HasDbSubmission from './HasDbSubmission';

interface BackupPanelProps extends HasDbSubmission {
  nameAndTimestamp: string;
}

const BackupPanel: React.FC<BackupPanelProps> = ({
  nameAndTimestamp,
  onSuccessfulSubmit,
  onFailedSubmit,
}) => {
  const { token } = useContext(AuthContext);

  return (
    <div className={'content-pane padded flex-container--horiz'}>
      <div className={'flex-container__box'}>
        <b>{nameAndTimestamp}</b>
      </div>
      <div className={'flex-container__box--small button-container'}>
        <button
          onClick={() => {
            fetch(
              process.env.REACT_APP_BACKEND_URL +
                '/backup/restore/' +
                nameAndTimestamp,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
              },
            ).then((r) => {
              alert(
                'Restoring from backup ' + (r.ok ? 'successful' : 'failed'),
              );
            });
          }}
        >
          Restore from this backup
        </button>
        <DeleteButton
          onClick={() => {
            fetch(
              process.env.REACT_APP_BACKEND_URL +
                '/backup/delete/' +
                nameAndTimestamp,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
              },
            ).then((r) => {
              if (r.ok && onSuccessfulSubmit) {
                onSuccessfulSubmit();
              } else if (onFailedSubmit) {
                onFailedSubmit();
              }
            });
          }}
        ></DeleteButton>
      </div>
    </div>
  );
};

const NewBackupPanel: React.FC<HasDbSubmission> = ({
  onSuccessfulSubmit,
  onFailedSubmit,
}) => {
  const { token } = useContext(AuthContext);

  const [name, setName] = useState('');

  return (
    <div className={'content-pane padded flex-container--horiz'}>
      <div className={'flex-container__box'}>
        <div style={{ maxWidth: '30ch' }}>
          <TextField value={name} setValue={setName} short />
        </div>
      </div>
      <div className={'flex-container__box--small button-container'}>
        <button
          disabled={name === ''}
          className={'visually-disabled'}
          onClick={() => {
            fetch(
              process.env.REACT_APP_BACKEND_URL + '/backup/create/' + name,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
              },
            ).then((r) => {
              if (r.ok && onSuccessfulSubmit) {
                setName('');
                onSuccessfulSubmit();
              } else if (onFailedSubmit) {
                onFailedSubmit();
              }
            });
          }}
        >
          Create backup
        </button>
      </div>
    </div>
  );
};
export const BackupsTab: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [existing, setExisting] = useState<string[]>([]);

  const fetchData = (): void => {
    fetch(process.env.REACT_APP_BACKEND_URL + '/backup/list', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then((response) => response.json())
      .then((data) => setExisting(data));
  };

  useEffect(() => {
    if (existing.length === 0) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.length]);

  return (
    <div className={'flex-container--vert'}>
      {existing.map((nameAndTimestamp) => (
        <BackupPanel
          key={nameAndTimestamp}
          nameAndTimestamp={nameAndTimestamp}
          onSuccessfulSubmit={fetchData}
        />
      ))}
      <NewBackupPanel onSuccessfulSubmit={fetchData} />
    </div>
  );
};
