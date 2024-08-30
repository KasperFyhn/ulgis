import { MultiValueToggle } from '../common/MultiValueToggle';
import React, { useState } from 'react';
import { TaxonomiesTab } from './TaxonomiesTab';
import { TextContentTab } from './TextContentTab';

export const AdminPage: React.FC = () => {
  // const [metadata, setMetadata] = useState<any>({
  //   name: '',
  //   shortDescription: '',
  //   text: '',
  //   uiLevel: 'Standard',
  //   priority: 1,
  //   group: [],
  // });

  const tabs = ['Taxonomies', 'Text Content'];

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);

  return (
    <div className={'flex-container--vert'}>
      <MultiValueToggle
        name={'tab-selector'}
        selected={selectedTab}
        onChange={(value) => setSelectedTab(value)}
        options={tabs}
      />
      {selectedTab === 'Taxonomies' && <TaxonomiesTab />}
      {selectedTab === 'Text Content' && <TextContentTab />}
    </div>
  );
};
