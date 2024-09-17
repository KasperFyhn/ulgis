import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { getAuthenticationService } from '../service/AuthenticationService';

interface AuthContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
  username: string | null;
  setUsername: (username: string | null) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setToken: () => {},
  username: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUsername: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('access_token'),
  );
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('access_token', token);
    } else {
      sessionStorage.removeItem('access_token');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getAuthenticationService().getCurrentUser(token).then(setUsername);
    } else {
      setUsername(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken, username, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};
