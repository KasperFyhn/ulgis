import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthProvider';
import { getAuthenticationService } from '../service/AuthenticationService';

interface PasswordInputProps {
  label: string;
  password: string;
  setPassword: (v: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  password,
  setPassword,
}) => {
  return (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );
};

export const UserTab: React.FC = () => {
  const { token, username } = useContext(AuthContext);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  const reset = (): void => {
    setOldPassword('');
    setNewPassword('');
    setNewPassword2('');
  };

  if (token === null || username === null) {
    return null;
  }

  return (
    <div className={'flex-container--vert content-pane padded'}>
      <h1>
        User: <b>{username}</b>
      </h1>

      <h2>Change password</h2>
      <PasswordInput
        label={'Old Password'}
        password={oldPassword}
        setPassword={setOldPassword}
      />
      <PasswordInput
        label={'New Password'}
        password={newPassword}
        setPassword={setNewPassword}
      />
      <PasswordInput
        label={'Repeat New Password'}
        password={newPassword2}
        setPassword={setNewPassword2}
      />
      <div>
        <button
          onClick={() => {
            if (
              oldPassword === '' ||
              newPassword === '' ||
              newPassword2 === ''
            ) {
              alert('Missing input!');
              return;
            } else if (newPassword !== newPassword2) {
              alert('New passwords do not match!');
              return;
            } else if (oldPassword === newPassword) {
              alert('New password is the same as the old!');
              return;
            }
            getAuthenticationService()
              .setPassword(token, username, oldPassword, newPassword)
              .then(
                () => {
                  reset();
                  alert('Successfully changed password.');
                },
                () => alert('Error changing password!'),
              );
          }}
        >
          Change password
        </button>
      </div>
    </div>
  );
};
