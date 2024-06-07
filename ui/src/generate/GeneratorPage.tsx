import '../common.scss';
import { DefaultGenerationService } from './GenerationService';
import React, { ReactElement, useEffect, useState } from 'react';
import {
  GenerationOptions,
  GenerationOptionsMetadata,
  GroupMetadata,
  initGenerationOptions,
  OptionGroup,
  ToggledOptionGroup,
  ToggledOptionGroupArray,
} from './models';
import Markdown from 'react-markdown';

import { useUiLevel } from '../App';
import { OptionGroupPanel } from './OptionGroupPanel';
import { ToggledOptionGroupPanel } from './ToggledOptionGroupPanel';
import { ToggledOptionGroupArrayPanel } from './ToggledOptionGroupArrayPanel';

function renderPanelContent(
  metadataEntry: [string, GroupMetadata],
  options: GenerationOptions,
  setOptions: (options: GenerationOptions) => void,
): ReactElement | undefined {
  const [key, metadata] = metadataEntry;
  switch (metadata.type) {
    case 'optionGroup':
      if (Object.keys(metadata.group).length < 1) {
        return undefined;
      }
      return (
        <div key={key} className={'options-group'}>
          <h1>{metadata.name}</h1>
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
        </div>
      );
    case 'toggledOptionGroup':
      if (Object.keys(metadata.group).length < 1) {
        return undefined;
      }
      return (
        <div key={key} className={'options-group'}>
          <h1>{metadata.name}</h1>
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
        </div>
      );
    case 'toggledOptionGroupArray':
      if (Object.keys(metadata.groups).length < 1) {
        return undefined;
      }
      return (
        <div key={key} className={'options-group'}>
          <h1>{metadata.name}</h1>
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
        </div>
      );
  }
}

const service = new DefaultGenerationService();

export const GeneratorPage: React.FC = () => {
  const { uiLevel } = useUiLevel();

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
          {renderPanelContent(
            ['taxonomies', topPanelMetadata],
            options,
            setOptions,
          )}
        </div>
      )}
      <div className={'flex-container--horiz'}>
        <div className={'content-pane flex-container__box padded'}>
          {leftPanelMetadata
            .map((metadataEntry) =>
              renderPanelContent(metadataEntry, options, setOptions),
            )
            .filter((obj) => obj !== undefined)}
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
