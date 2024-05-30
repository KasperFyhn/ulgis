import '../common.scss';
import { DefaultGenerationService } from './GenerationService';
import React, { ReactElement, useEffect, useState } from 'react';
import {
  filterByLevel,
  GenerationOptions,
  GenerationOptionsMetadata,
  initGenerationOptions,
  OptionGroup,
  OptionGroupMetadata,
  ToggledOptionGroup,
  ToggledOptionGroupArray,
  ToggledOptionGroupArrayMetadata,
  ToggledOptionGroupMetadata,
} from './models';
import Markdown from 'react-markdown';

import { useUiLevel } from '../App';
import { OptionGroupPanel } from './OptionGroupPanel';
import { ToggledOptionGroupPanel } from './ToggledOptionGroupPanel';
import { ToggledOptionGroupArrayPanel } from './ToggledOptionGroupArrayPanel';

function renderPanelContent(
  metadataEntry: [
    string,
    (
      | OptionGroupMetadata
      | ToggledOptionGroupMetadata
      | ToggledOptionGroupArrayMetadata
    ),
  ],
  options: GenerationOptions,
  setOptions: (options: GenerationOptions) => void,
): ReactElement {
  const [key, metadata] = metadataEntry;
  switch (metadata.type) {
    case 'optionGroup':
      return (
        <OptionGroupPanel
          key={key}
          metadata={metadata}
          getAndSet={[
            () => options[key] as OptionGroup,
            (v) => {
              options[key] = v;
              setOptions({ ...options });
            },
          ]}
        />
      );
    case 'toggledOptionGroup':
      return (
        <ToggledOptionGroupPanel
          key={key}
          metadata={metadata}
          getAndSet={[
            () => options[key] as ToggledOptionGroup,
            (v) => {
              options[key] = v;
              setOptions({ ...options });
            },
          ]}
        />
      );
    case 'toggledOptionGroupArray':
      return (
        <ToggledOptionGroupArrayPanel
          key={key}
          metadata={metadata}
          vertical={key !== 'taxonomies'} // TODO: fix this hack
          getAndSet={[
            () => options[key] as ToggledOptionGroupArray,
            (v) => {
              options[key] = v;
              setOptions({ ...options });
            },
          ]}
        />
      );
  }
}

export const GeneratorPage: React.FC = () => {
  const service = new DefaultGenerationService();

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

  const optionMetadataList = Object.entries(optionsMetadata);
  const topPanelMetadata = optionMetadataList[0];
  const halfLength = Math.floor(optionMetadataList.length / 2) + 1;
  const leftPanelMetadata = optionMetadataList.slice(1, halfLength);
  const rightPanelMetadata = optionMetadataList.slice(halfLength);

  return (
    <div className={'flex-container--vert'}>
      <div className={'content-pane flex-container__box padded'}>
        {renderPanelContent(topPanelMetadata, options, setOptions)}
      </div>
      <div className={'flex-container--horiz'}>
        <div className={'content-pane flex-container__box padded'}>
          {leftPanelMetadata.map((metadataEntry) =>
            renderPanelContent(metadataEntry, options, setOptions),
          )}
        </div>
        <div
          className={'content-pane flex-container__box size_40percent padded'}
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
          {rightPanelMetadata.map((metadataEntry) =>
            renderPanelContent(metadataEntry, options, setOptions),
          )}
        </div>
      </div>
    </div>
  );
};
