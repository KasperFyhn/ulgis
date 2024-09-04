import React, { useState } from 'react';
import { getAuthenticationService } from '../service/AuthenticationService';

interface LoginFormProps {
  onRetrievedToken: (token: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onRetrievedToken }) => {
  // Form state management
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault(); // Prevent default form submission behavior
    getAuthenticationService()
      .getToken(username, password)
      .then((t) => onRetrievedToken(t))
      .catch((err) => setError(err.message));
  };

  return (
    <div className={'content-pane padded'}>
      <form className={'flex-container--vert'} onSubmit={handleSubmit}>
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};
