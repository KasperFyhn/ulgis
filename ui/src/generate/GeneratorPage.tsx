import '../common.scss';
import { DefaultGenerationService } from './GenerationService';
import React, { useEffect, useState } from 'react';
import {
  GenerationOptions,
  GenerationOptionsMetadata,
  initGenerationOptions,
  overwriteFromPrevOptions,
  UiLevel,
} from './models';

import { OptionsPanel } from './OptionsPanel';
import { GenerationPane } from './GenerationPane';

const service = new DefaultGenerationService();

interface GeneratorPageProps {
  uiLevel: UiLevel;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({
  uiLevel,
}: GeneratorPageProps) => {
  // metadata that determines the input fields that the user can interact with
  // as well as the shape of the object which is changed via those input fields
  // the shape of the metadata is determined by UI level
  const [optionsMetadata, setOptionsMetadata] = useState<
    GenerationOptionsMetadata | undefined
  >(undefined);

  // the main state object that contains input values from the user
  const [options, setOptions] = useState<GenerationOptions>(
    new GenerationOptions(),
  );

  // earlier state objects from specific UI levels which can be reused along
  // with the previous state that the UI change is transitioning away from
  const [prevOptionStates, setPrevOptionStates] = useState<
    Map<string, GenerationOptions>
  >(new Map());

  useEffect(() => {
    // load metadata for the UI level;
    service.getGenerationOptionsMetadata(uiLevel).then((metadata) => {
      setOptionsMetadata((prevMetadata) => {
        if (prevMetadata) {
          // if transitioning from one UI level to another, the state is stored
          // for that specific metadata
          setPrevOptionStates((prevMap) => {
            prevMap.set(JSON.stringify(prevMetadata), { ...options });
            return new Map(prevMap.entries());
          });
        }
        return metadata;
      });
      setOptions((prevState) => {
        // get options from earlier state at specific UI level (see above) or
        // initialize new options
        const newOptions =
          prevOptionStates.get(JSON.stringify(metadata)) ??
          initGenerationOptions(metadata);

        // re-use as much input as possible from the previous state that we are
        // transitioning away from
        overwriteFromPrevOptions(metadata, newOptions, prevState);

        // ultimately, this 'newOptions' object contains any input from when the
        // user was earlier on that UI level and then any recent input from
        // the previous state
        return newOptions;
      });
    });
    // this should only run on UI level update. do not give in to
    // ESlint's complaints about missing dependencies in the array
  }, [uiLevel]);

  if (optionsMetadata === undefined) {
    return <div>Loading...</div>;
  }

  const optionMetadataList = Object.entries(optionsMetadata);
  const topPanelMetadata = optionsMetadata.taxonomies;
  if (optionsMetadata.taxonomies) {
    optionMetadataList.splice(
      optionMetadataList.findIndex((entry) => entry[0] === 'taxonomies'),
      1,
    );
  }
  const halfLength = Math.floor(optionMetadataList.length / 2);
  const leftPanelMetadata = optionMetadataList.slice(0, halfLength);
  const rightPanelMetadata = optionMetadataList.slice(halfLength);

  return (
    <div className={'flex-container--vert'}>
      {topPanelMetadata && (
        <div className={'content-pane flex-container__box padded'}>
          <OptionsPanel
            metadataEntry={['taxonomies', topPanelMetadata]}
            options={options}
            setOptions={setOptions}
          />
        </div>
      )}
      <div className={'flex-container--horiz'}>
        <div className={'content-pane flex-container__box--equal-size padded'}>
          {leftPanelMetadata
            .map((metadataEntry) => (
              <OptionsPanel
                key={metadataEntry[0]}
                metadataEntry={metadataEntry}
                options={options}
                setOptions={setOptions}
              />
            ))
            .filter((obj) => obj !== undefined)}
        </div>
        <GenerationPane generationOptions={options} service={service} />
        <div className={'content-pane flex-container__box--equal-size padded'}>
          {rightPanelMetadata.map((metadataEntry) => (
            <OptionsPanel
              key={metadataEntry[0]}
              metadataEntry={metadataEntry}
              options={options}
              setOptions={setOptions}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
