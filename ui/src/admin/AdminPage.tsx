import React, { useContext } from 'react';
import { TaxonomiesTab } from './TaxonomiesTab';
import { TextContentTab } from './TextContentTab';
import { LoginForm } from './LoginPage';
import { AuthContext, AuthProvider } from './AuthProvider';
import { Link, Route, Routes } from 'react-router-dom';
import { BackupsTab } from './BackupsTab';
import { UserTab } from './UserTab';
import { NotFoundPage } from '../common/NotFoundPage';

interface AdminPageNavBarProps {
  username?: string;
}

const AdminPageNavBar: React.FC<AdminPageNavBarProps> = () => {
  const { setToken, username } = useContext(AuthContext);

  return (
    <nav className={'nav nav--site-nav theme--dark'}>
      <div className={'nav__site'}>
        <Link className={'nav__home home-title'} to={''}>
          ULGIS ADMIN PAGE
        </Link>
        {username && (
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
        )}
      </div>

      <div className={'nav__utilities'}>
        <Link className={'nav__item'} to={'/'}>
          &#8617; Back to Main Page
        </Link>
        {username && (
          <>
            <Link className={'nav__item nav__item--icon icon-user'} to={'user'}>
              {username}
            </Link>
            <div className={'nav__item'}>
              <button
                className={'button--icon button--icon--right icon-sign-out'}
                onClick={() => {
                  setToken(null);
                }}
              >
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

const AdminPageInner: React.FC = () => {
  const { token, username } = useContext(AuthContext);

  if (token === null || username === null) {
    return <LoginForm />;
  }

  return (
    <Routes>
      <Route
        path=""
        element={
          <p>
            Welcome, <b>{username}</b>!
          </p>
        }
      />
      <Route path="taxonomies" element={<TaxonomiesTab />} />
      <Route path="text-content" element={<TextContentTab />} />
      <Route path="backups" element={<BackupsTab />} />
      <Route path="user" element={<UserTab />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export const AdminPage: React.FC = () => {
  return (
    <AuthProvider>
      <AdminPageNavBar />
      <div className={'app__content'}>
        <AdminPageInner />
      </div>
    </AuthProvider>
  );
};
