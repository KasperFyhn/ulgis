import React, { useEffect, useState } from 'react';
import { TaxonomiesTab } from './TaxonomiesTab';
import { TextContentTab } from './TextContentTab';
import { MultiValueToggle } from '../common/input/MultiValueToggle';
import { getAuthenticationService } from '../service/AuthenticationService';
import { LoginForm } from './LoginPage';

export const AdminPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem('access_key'),
  );

  const [username, setUsername] = useState('NO USER');

  useEffect(() => {
    if (token !== null) {
      getAuthenticationService()
        .getCurrentUser(token)
        .then((u) => setUsername(u));
    }
  }, [token]);

  const tabs = ['Taxonomies', 'Text Content'];

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);

  if (token === null || username === undefined) {
    return (
      <LoginForm
        onRetrievedToken={(t) => {
          sessionStorage.setItem('access_key', t);
          setToken(t);
        }}
      />
    );
  }

  return (
    <div className={'flex-container--vert'}>
      <div>
        <MultiValueToggle
          name={'tab-selector'}
          selected={selectedTab}
          onChange={(value) => setSelectedTab(value)}
          options={tabs}
        />
        <div className={'flex-container--horiz'} style={{ float: 'right' }}>
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

      {selectedTab === 'Taxonomies' && <TaxonomiesTab />}
      {selectedTab === 'Text Content' && <TextContentTab />}
    </div>
  );
};
