import '../common.css';
import { LocalGenerationService } from './GenerationService';
import React, { useEffect, useState } from 'react';
import {
  filterByLevel,
  GenerationOptions,
  GenerationOptionsMetadata,
  initGenerationOptions,
} from './models';
import Markdown from 'react-markdown';
import { ToggledOptionGroupArrayPanel } from './ToggledOptionGroupArrayPanel';
import { OptionGroupPanel } from './OptionGroupPanel';

import { useUiLevel } from '../App';

export const GeneratorPage: React.FC = () => {
  const service = new LocalGenerationService();

  const { uiLevel } = useUiLevel();

  const [cachedOptionsMetadata, setCachedOptionsMetadata] = useState<
    GenerationOptionsMetadata | undefined
  >(undefined);
  const [optionsMetadata, setOptionsMetadata] = useState<
    GenerationOptionsMetadata | undefined
  >(undefined);

  const [options, setOptions] = useState<GenerationOptions>(
    new GenerationOptions(),
  );

  useEffect(() => {
    if (cachedOptionsMetadata !== undefined) {
      setOptionsMetadata(() => filterByLevel(cachedOptionsMetadata, uiLevel));
    }
  }, [uiLevel, cachedOptionsMetadata]);

  useEffect(() => {
    if (optionsMetadata === undefined) {
      service.getGenerationOptionsMetadata().then((metadata) => {
        console.log(metadata);
        setCachedOptionsMetadata(() => metadata);
        setOptionsMetadata(() => filterByLevel(metadata, uiLevel));
        setOptions(() => initGenerationOptions(metadata));
      });
    }
  });

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
  return (
    <div className={'flex-container--vert'}>
      <div className={'shadow-border flex-container__box padded'}>
        <h1>Taxonomies</h1>
        <ToggledOptionGroupArrayPanel
          metadata={optionsMetadata.taxonomies}
          getAndSet={[
            () => options.taxonomies,
            (v) =>
              setOptions({
                ...options,
                taxonomies: v,
              }),
          ]}
        />
      </div>
      <div className={'flex-container--horiz'}>
        <div className={'shadow-border flex-container__box padded'}>
          <h1>Education Info</h1>
          <OptionGroupPanel
            metadata={optionsMetadata.educationInfo}
            getAndSet={[
              () => options.educationInfo,
              (v) => setOptions({ ...options, educationInfo: v }),
            ]}
          />
        </div>

        <div
          className={'shadow-border flex-container__box size_40percent padded'}
        >
          {response && <Markdown>{response}</Markdown>}
          {creatingResponse && response === '' && <p>Connecting ...</p>}
          {!creatingResponse && (
            <>
              <button onClick={createResponse}>Run prompt on ULGIS</button>
              <button onClick={createPrompt}>Show prompt</button>
            </>
          )}
        </div>
        <div className={'shadow-border flex-container__box padded'}>
          {Object.keys(optionsMetadata.outputOptions.groups).length > 0 && (
            <>
              <h1>Output Options</h1>
              <ToggledOptionGroupArrayPanel
                vertical
                metadata={optionsMetadata.outputOptions}
                getAndSet={[
                  () => options.outputOptions,
                  (v) =>
                    setOptions({
                      ...options,
                      outputOptions: v,
                    }),
                ]}
              />
            </>
          )}
          {Object.keys(optionsMetadata.customInputs.group).length > 0 && (
            <>
              <h1>Custom Input</h1>
              <OptionGroupPanel
                metadata={optionsMetadata.customInputs}
                getAndSet={[
                  () => options.customInputs,
                  (v) => setOptions({ ...options, customInputs: v }),
                ]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
