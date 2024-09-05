import React, { useContext, useEffect, useState } from 'react';
import { UiLevel } from '../generate/models';
import { TextField } from '../common/input/TextField';
import { StringOptions } from '../common/input/StringOptions';
import { NumberSlider } from '../common/input/NumberSlider';
import { AuthContext } from './AuthProvider';
import Markdown from 'react-markdown';

interface ParameterItem {
  id: number;
  name: string;
  shortDescription: string;
}

interface TaxonomyItem {
  id?: number;
  name: string;
  shortDescription: string;
  text: string;
  uiLevel: UiLevel;
  priority: number;
  group: ParameterItem[];
}

interface TaxonomyEditorProps {
  taxonomy: TaxonomyItem;
}

const TaxonomyEditor: React.FC<TaxonomyEditorProps> = ({ taxonomy }) => {
  const [editableTaxonomy, setEditableTaxonomy] = useState<TaxonomyItem>({
    ...taxonomy,
  });

  const { token } = useContext(AuthContext);

  return (
    <div className={'flex-container--vert content-pane padded'}>
      Name
      <TextField
        value={editableTaxonomy.name}
        setValue={(value) =>
          setEditableTaxonomy((prev) => ({
            ...prev,
            name: value,
          }))
        }
        short
      />
      Description
      <TextField
        value={editableTaxonomy.shortDescription}
        setValue={(value) =>
          setEditableTaxonomy((prev) => ({
            ...prev,
            shortDescription: value,
          }))
        }
      />
      Text
      <TextField
        value={editableTaxonomy.text}
        setValue={(value) =>
          setEditableTaxonomy((prev) => ({
            ...prev,
            text: value,
          }))
        }
      />
      UI Level
      <StringOptions
        name={editableTaxonomy.name + '_uiLevel'}
        value={editableTaxonomy.uiLevel}
        setValue={(value) =>
          setEditableTaxonomy((prev) => ({
            ...prev,
            uiLevel: value as UiLevel,
          }))
        }
        options={['Standard', 'Modular', 'Ample']}
      />
      Priority
      <NumberSlider
        min={0}
        max={10}
        step={0.1}
        value={editableTaxonomy.priority}
        setValue={(value) =>
          setEditableTaxonomy((prev) => ({
            ...prev,
            priority: value,
          }))
        }
      />
      <details>
        <summary>Parameters</summary>
        {editableTaxonomy.group &&
          editableTaxonomy.group.map((p, i) => (
            <div key={i} className={'group flex-container--vert'}>
              ID: {p.id}
              <br />
              Name
              <TextField
                value={p.name}
                setValue={(value) => {
                  editableTaxonomy.group[i].name = value;
                  setEditableTaxonomy({ ...editableTaxonomy });
                }}
                short
              />
              Description
              <TextField
                value={p.shortDescription ?? ''}
                setValue={(value) => {
                  editableTaxonomy.group[i].shortDescription = value;
                  setEditableTaxonomy({ ...editableTaxonomy });
                }}
              />
            </div>
          ))}
      </details>
      <button
        className={'visually-disabled'}
        disabled={JSON.stringify(taxonomy) === JSON.stringify(editableTaxonomy)}
        onClick={() => {
          fetch(process.env.REACT_APP_BACKEND_URL + '/data/taxonomies', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify(editableTaxonomy),
          });
        }}
      >
        Submit
      </button>
      <button
        onClick={() => {
          fetch(
            process.env.REACT_APP_BACKEND_URL +
              '/data/taxonomies/' +
              editableTaxonomy.id,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
              },
            },
          );
        }}
      >
        Delete
      </button>
    </div>
  );
};

interface TaxonomyViewProps {
  taxonomy: TaxonomyItem;
}

const TaxonomyView: React.FC<TaxonomyViewProps> = ({ taxonomy }) => {
  return (
    <div className={'flex-container--vert content-pane padded'}>
      <h1>{taxonomy.name}</h1>
      <span>ID: {taxonomy.id || 'NONE'}</span>
      <span>Description: {taxonomy.shortDescription}</span>
      <span>UI Level: {taxonomy.uiLevel}</span>
      <span>Priority: {taxonomy.priority}</span>

      <details>
        <summary>Text</summary>
        <Markdown>{taxonomy.text}</Markdown>
      </details>

      <details>
        <summary>Parameters</summary>
        {taxonomy.group &&
          taxonomy.group.map((p, i) => (
            <div key={i} className={'group flex-container--vert'}>
              <span>ID: {p.id}</span>
              <span>Name: {p.name}</span>
              <span>Description: {p.shortDescription || 'NONE'}</span>
            </div>
          ))}
      </details>
    </div>
  );
};

export const TaxonomiesTab: React.FC = () => {
  const [existing, setExisting] = useState<TaxonomyItem[]>([]);
  const [editing, setEditing] = useState<TaxonomyItem | undefined>(undefined);

  useEffect(() => {
    if (existing.length === 0) {
      console.log('here');
      fetch(process.env.REACT_APP_BACKEND_URL + '/data/taxonomies')
        .then((response) => response.json())
        .then((data) => setExisting(data));
    }
  }, [existing.length]);

  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(undefined)}>Back</button>

        <TaxonomyEditor taxonomy={editing} />
      </div>
    );
  }

  return (
    <div className={'flex-container--vert'}>
      {existing.map((taxonomy) => (
        <div key={taxonomy.id}>
          <button onClick={() => setEditing(taxonomy)}>Edit</button>

          <TaxonomyView taxonomy={taxonomy} key={taxonomy.name} />
        </div>
      ))}
      <button
        onClick={() => {
          existing.push({
            name: 'New Taxonomy',
            priority: 0,
            shortDescription: '',
            text: '',
            uiLevel: 'Standard',
            group: [],
          });
          setExisting([...existing]);
        }}
      >
        Add new taxonomy
      </button>
    </div>
  );
};
