import '../common.css';
import { LocalGenerationService } from './GenerationService';
import React, { useEffect, useState } from 'react';
import {
  GenerationOptions,
  GenerationOptionsMetadata,
  initGenerationOptions,
} from './models';
import Markdown from 'react-markdown';
import { ToggledOptionGroupArrayPanel } from './ToggledOptionGroupArrayPanel';
import { OptionGroupPanel } from './OptionGroupPanel';
import { ToggledOptionGroupPanel } from './ToggledOptionGroupPanel';

export const GeneratorPage: React.FC = () => {
  const service = new LocalGenerationService();

  const [optionsMetadata, setOptionsMetadata] = useState<
    GenerationOptionsMetadata | undefined
  >(undefined);

  const [options, setOptions] = useState<GenerationOptions>(
    new GenerationOptions(),
  );

  useEffect(() => {
    if (optionsMetadata === undefined) {
      service.getGenerationOptionsMetadata().then((metadata) => {
        console.log(metadata);
        setOptionsMetadata(() => metadata);
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

  // const getJsonSchema: () => void = () => {
  //   setCreatingResponse(true);
  //   setResponse('Creating prompt ...');
  //   service.getGenerationOptionsSchema().then((schema) => {
  //     setResponse(JSON.stringify(schema, null, 2).replaceAll('\n', '\n\n\t'));
  //     setCreatingResponse(false);
  //   });
  // };

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
          <h1>Settings</h1>
          <OptionGroupPanel
            metadata={optionsMetadata.settings}
            getAndSet={[
              () => options.settings,
              (v) => setOptions({ ...options, settings: v }),
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
              <button onClick={createResponse}>
                Generate learning outcomes
              </button>
              <button onClick={createPrompt}>Create prompt</button>
              {/*<button onClick={getJsonSchema}>JSON Schema</button>*/}
            </>
          )}
        </div>
        <div className={'shadow-border flex-container__box--big padded'}>
          <h1>Custom Input</h1>
          <ToggledOptionGroupPanel
            metadata={optionsMetadata.customInputs}
            getAndSet={[
              () => options.customInputs,
              (v) => setOptions({ ...options, customInputs: v }),
            ]}
          />
          <h1>Output Formatting</h1>
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
        </div>
      </div>
    </div>
  );
};
