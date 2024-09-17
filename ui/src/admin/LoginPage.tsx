import React, { useContext, useState } from 'react';
import { getAuthenticationService } from '../service/AuthenticationService';
import { Notification } from '../common/Notification';
import { AuthContext } from './AuthProvider';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { setToken } = useContext(AuthContext);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault(); // Prevent default form submission behavior
    getAuthenticationService()
      .getToken(username, password)
      .then(setToken)
      .catch((err) => setError(err.message));
  };

  return (
    <div className={'content-pane padded'}>
      <form className={'flex-container--vert'} onSubmit={handleSubmit}>
        {error && (
          <Notification type={'warning'} nonDismissible>
            {error}
          </Notification>
        )}
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};
