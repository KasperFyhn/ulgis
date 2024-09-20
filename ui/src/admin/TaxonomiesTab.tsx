import React, { useContext, useEffect, useState } from 'react';
import { UiLevel } from '../generate/models';
import { TextField } from '../common/input/TextField';
import { StringOptions } from '../common/input/StringOptions';
import { NumberSlider } from '../common/input/NumberSlider';
import { AuthContext } from './AuthProvider';
import { DeleteButton } from './DeleteButton';
import { HelpTooltip } from '../common/HelpTooltip';
import HasDbSubmission from './HasDbSubmission';
import { getTaxonomyService, TaxonomyItem } from '../service/TaxonomyService';

interface TaxonomyEditorProps extends HasDbSubmission {
  taxonomy: TaxonomyItem;
}

const TaxonomyEditor: React.FC<TaxonomyEditorProps> = ({
  taxonomy,
  onSuccessfulSubmit,
  onFailedSubmit,
}) => {
  const [editableTaxonomy, setEditableTaxonomy] =
    useState<TaxonomyItem>(taxonomy);

  useEffect(() => {
    setEditableTaxonomy(structuredClone(taxonomy));
  }, [taxonomy]);

  const { token } = useContext(AuthContext);

  if (!token) {
    return null;
  }

  return (
    <div className={'flex-container--vert content-pane padded'}>
      <div className={'flex-container--horiz'}>
        <div className={'flex-container__box--equal-size flex-container--vert'}>
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
          <span>
            Priority
            <HelpTooltip
              tooltipId={'priority'}
              content={
                'Higher priority means that the taxonomy will be further to ' +
                'the left in the Taxonomies panel.'
              }
            />
          </span>
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
        </div>
        <div className={'flex-container__box--equal-size flex-container--vert'}>
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
        </div>
      </div>
      <details>
        <summary>Parameters</summary>
        <div className={'flex-container--horiz'}>
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
                <DeleteButton
                  onClick={() => {
                    setEditableTaxonomy((prev) => {
                      const group = prev.group;
                      group.splice(i, 1);
                      return {
                        ...prev,
                        group: [...group],
                      };
                    });
                  }}
                >
                  Delete
                </DeleteButton>
              </div>
            ))}
          <button
            className={'button--icon button--icon--hide-label icon-add'}
            onClick={() => {
              setEditableTaxonomy((prev) => ({
                ...prev,
                group: prev.group.concat({
                  name: 'Parameter ' + (prev.group.length + 1),
                  shortDescription: '',
                }),
              }));
            }}
          />
        </div>
      </details>
      <div className={'button-container button-container--centered'}>
        <button
          className={'visually-disabled'}
          disabled={
            JSON.stringify(taxonomy) === JSON.stringify(editableTaxonomy)
          }
          onClick={() => {
            getTaxonomyService()
              // token will always be defined in this component
              // eslint-disable-next-line
              .putOrUpdateTaxonomy(editableTaxonomy, token)
              .then(onSuccessfulSubmit, onFailedSubmit);
          }}
        >
          Save changes
        </button>
        <button
          className={'visually-disabled'}
          disabled={
            JSON.stringify(taxonomy) === JSON.stringify(editableTaxonomy)
          }
          onClick={() => setEditableTaxonomy(structuredClone(taxonomy))}
        >
          Discard changes
        </button>
        {editableTaxonomy.id !== undefined && (
          <DeleteButton
            onClick={() => {
              getTaxonomyService()
                // id will always be defined here
                // eslint-disable-next-line
                .deleteTaxonomy(editableTaxonomy.id!, token)
                .then(onSuccessfulSubmit, onFailedSubmit);
            }}
          >
            Delete
          </DeleteButton>
        )}
      </div>
    </div>
  );
};

export const TaxonomiesTab: React.FC = () => {
  const [existing, setExisting] = useState<TaxonomyItem[]>([]);

  const fetchData = (): void => {
    getTaxonomyService().getTaxonomies().then(setExisting);
  };

  useEffect(() => {
    if (existing.length === 0) {
      fetchData();
    }
  }, [existing.length]);

  return (
    <div className={'flex-container--vert'}>
      {existing.map((taxonomy) => (
        <div key={taxonomy.id ?? -1}>
          <TaxonomyEditor
            taxonomy={taxonomy}
            onSuccessfulSubmit={fetchData}
            onFailedSubmit={() => alert('Failed')}
          />
        </div>
      ))}
      {(existing.length === 0 ||
        existing[existing.length - 1].id !== undefined) && (
        <button
          onClick={() => {
            setExisting((prev) => [
              ...prev,
              {
                name: '',
                priority: 0,
                shortDescription: '',
                text: '',
                uiLevel: 'Standard',
                group: [],
              },
            ]);
          }}
        >
          Add new taxonomy
        </button>
      )}
    </div>
  );
};
