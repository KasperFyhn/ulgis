import React, { useContext, useEffect, useState } from 'react';
import { TaxonomiesTab } from './TaxonomiesTab';
import { TextContentTab } from './TextContentTab';
import { getAuthenticationService } from '../service/AuthenticationService';
import { LoginForm } from './LoginPage';
import { AuthContext, AuthProvider } from './AuthProvider';
import { Link, Route, Routes } from 'react-router-dom';
import { BackupsTab } from './BackupsTab';

const AdminPageInner: React.FC = () => {
  const { token, setToken } = useContext(AuthContext);

  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (token !== null) {
      getAuthenticationService().getCurrentUser(token).then(setUsername);
    }
  }, [token]);

  if (token === null || username === undefined) {
    return (
      <LoginForm
        onRetrievedToken={(t) => {
          setToken(t);
        }}
      />
    );
  }

  return (
    <div className={'flex-container--vert'}>
      <nav className={'nav nav--site-nav'}>
        <div className={'nav__site'}>
          <div className={'nav__items'}>
            <Link className={'nav__item'} to={'taxonomies'}>
              Taxonomies
            </Link>
            <Link className={'nav__item'} to={'text-content'}>
              Text Content
            </Link>
            <Link className={'nav__item'} to={'backups'}>
              Backups
            </Link>
          </div>
        </div>

        <div className={'nav__utilities'}>
          <div className={'nav__item flex-container--horiz'}>
            <span>
              Logged in as <b>{username}</b>
            </span>
            <button
              onClick={() => {
                sessionStorage.removeItem('access_key');
                setToken(null);
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="" element={'Welcome, ' + username} />
        <Route path="taxonomies" element={<TaxonomiesTab />} />
        <Route path="text-content" element={<TextContentTab />} />
        <Route path="backups" element={<BackupsTab />} />
      </Routes>
    </div>
  );
};

export const AdminPage: React.FC = () => {
  return (
    <AuthProvider>
      <AdminPageInner />
    </AuthProvider>
  );
};
