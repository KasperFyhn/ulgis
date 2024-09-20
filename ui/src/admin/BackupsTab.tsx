import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthProvider';
import { DeleteButton } from './DeleteButton';
import { TextField } from '../common/input/TextField';
import HasDbSubmission from './HasDbSubmission';
import { getBackupService } from '../service/BackupService';

interface BackupPanelProps extends HasDbSubmission {
  nameAndTimestamp: string;
}

const BackupPanel: React.FC<BackupPanelProps> = ({
  nameAndTimestamp,
  onSuccessfulSubmit,
  onFailedSubmit,
}) => {
  const { token } = useContext(AuthContext);

  if (token === null) {
    return null;
  }

  return (
    <div className={'content-pane padded flex-container--horiz'}>
      <div className={'flex-container__box'}>
        <b>{nameAndTimestamp}</b>
      </div>
      <div className={'flex-container__box--small button-container'}>
        <button
          onClick={() => {
            getBackupService()
              .restore(nameAndTimestamp, token)
              .then(
                () => alert('Restoring from backup successful'),
                () => alert('failed'),
              );
          }}
        >
          Restore from this backup
        </button>
        <DeleteButton
          onClick={() => {
            getBackupService()
              .delete(nameAndTimestamp, token)
              .then(onSuccessfulSubmit, onFailedSubmit);
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

  if (token === null) {
    return null;
  }

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
            getBackupService()
              .create(name, token)
              .then(() => {
                setName('');
                if (onSuccessfulSubmit) onSuccessfulSubmit();
              }, onFailedSubmit);
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
    if (token !== null) {
      getBackupService()
        .list(token)
        .then((data) => setExisting(data));
    }
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
