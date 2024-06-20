import '../common.scss';
import { DefaultGenerationService } from './GenerationService';
import React, { useContext, useEffect, useState } from 'react';
import {
  GenerationOptions,
  GenerationOptionsMetadata,
  initGenerationOptions,
} from './models';
import Markdown from 'react-markdown';

import { UiLevelContext } from '../App';
import { OptionsPanel } from './OptionsPanel';

const service = new DefaultGenerationService();

export const GeneratorPage: React.FC = () => {
  const { uiLevel } = useContext(UiLevelContext);

  const [optionsMetadata, setOptionsMetadata] = useState<
    GenerationOptionsMetadata | undefined
  >(undefined);

  const [options, setOptions] = useState<GenerationOptions>(
    new GenerationOptions(),
  );

  useEffect(() => {
    service.getGenerationOptionsMetadata(uiLevel).then((metadata) => {
      setOptionsMetadata(() => metadata);
      setOptions(() => initGenerationOptions(metadata));
    });
  }, [uiLevel]);

  const [creatingResponse, setCreatingResponse] = useState(false);
  const [response, setResponse] = useState<string | undefined>(undefined);

  const createResponse: () => void = () => {
    setCreatingResponse(true);
    setResponse(() => '');
    service.generateAsStream(
      options,
      (event: MessageEvent) => {
        setResponse(
          (prevResponse) =>
            prevResponse +
            event.data.toString().replaceAll('\\n', '\n').replaceAll('•', '-'),
        );
      },
      () => setCreatingResponse(false),
    );
  };

  const createPrompt: () => void = () => {
    setCreatingResponse(true);
    setResponse('Creating prompt ...');
    service.createPrompt(options).then((prompt) => {
      setResponse(prompt);
      setCreatingResponse(false);
    });
  };

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
        <div className={'content-pane flex-container__box padded'}>
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
        <div
          className={
            'content-pane flex-container__box--big size_40percent padded'
          }
        >
          {response && <Markdown>{response}</Markdown>}
          {creatingResponse && response === '' && <p>Connecting ...</p>}
          {!creatingResponse && (
            <div className={'button-container'}>
              <button onClick={createResponse}>Run prompt on ULGIS</button>
              <button onClick={createPrompt}>Show prompt</button>
            </div>
          )}
        </div>
        <div className={'content-pane flex-container__box padded'}>
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
