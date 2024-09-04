import React, { useEffect, useState } from 'react';
import { UiLevel } from '../generate/models';
import { MultiValueToggle } from '../common/input/MultiValueToggle';

interface TaxonomyItem {
  name: string;
  shortDescription: string;
  text: string;
  uiLevel: UiLevel;
  priority: number;
}

interface TaxonomyEditorProps {
  taxonomy: TaxonomyItem;
}

const TaxonomyEditor: React.FC<TaxonomyEditorProps> = ({ taxonomy }) => {
  const [editableTaxonomy, setEditableTaxonomy] = useState<TaxonomyItem>({
    ...taxonomy,
  });

  return (
    <div className={'content-pane padded'}>
      <h1>{taxonomy.name}</h1>
      Name
      <input
        required
        type="text"
        value={editableTaxonomy.name}
        onChange={(event) =>
          setEditableTaxonomy({
            ...editableTaxonomy,
            name: event.target.value,
          })
        }
      />
      Description
      <input
        required
        type="text"
        value={editableTaxonomy.shortDescription}
        onChange={(event) =>
          setEditableTaxonomy({
            ...editableTaxonomy,
            shortDescription: event.target.value,
          })
        }
      />
      UI Level
      <div>
        <MultiValueToggle
          name={taxonomy.name + '_uiLevel'}
          selected={editableTaxonomy.uiLevel}
          onChange={(value) =>
            setEditableTaxonomy({
              ...editableTaxonomy,
              uiLevel: value as UiLevel,
            })
          }
          options={['Standard', 'Modular', 'Ample']}
        />
      </div>
      <button
        className={'visually-disabled'}
        disabled={JSON.stringify(taxonomy) === JSON.stringify(editableTaxonomy)}
        onClick={() => {
          fetch(process.env.REACT_APP_BACKEND_URL + '/data/taxonomies', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(editableTaxonomy),
          }).then((r) => {
            if (r.ok) {
              taxonomy = { ...editableTaxonomy };
            }
          });
        }}
      >
        Submit
      </button>
    </div>
  );
};

export const TaxonomiesTab: React.FC = () => {
  const [existing, setExisting] = useState<TaxonomyItem[]>([]);

  useEffect(() => {
    if (existing.length === 0) {
      fetch(process.env.REACT_APP_BACKEND_URL + '/data/taxonomies')
        .then((response) => response.json())
        .then((data) => setExisting(data));
    }
  });

  return (
    <div className={'flex-container--vert'}>
      {existing.map((taxonomy) => (
        <TaxonomyEditor taxonomy={taxonomy} key={taxonomy.name} />
      ))}
      <button
        onClick={() => {
          existing.push({
            name: 'New Taxonomy',
            priority: 0,
            shortDescription: '',
            text: '',
            uiLevel: 'Standard',
          });
          setExisting([...existing]);
        }}
      >
        Add new taxonomy
      </button>
    </div>
  );
};
