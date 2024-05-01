import '../common.css';
import {
  GenerationOptions,
  GenerationOptionsMetadata,
  GenerationServiceMockup,
  OptionType,
} from './GenerationService';
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Options } from './Options';

export const GeneratorPage: React.FC = () => {
  const service = new GenerationServiceMockup();

  const [optionsMetadata, setOptionsMetadata] = useState<
    GenerationOptionsMetadata | undefined
  >(undefined);

  const [options, setOptions] = useState<GenerationOptions>(
    new GenerationOptions(),
  );
  const optionGetterAndSetter: <T extends OptionType>(
    field: string,
    key: string,
  ) => [() => OptionType, (v: T) => void] = <T extends OptionType>(
    field: string,
    key: string,
  ) => {
    const getter: () => OptionType = () => {
      return options[field][key];
    };
    const setter: (v: T) => void = (value) => {
      const updated: GenerationOptions = { ...options };
      updated[field][key] = value;
      setOptions(updated);
    };
    return [getter, setter];
  };

  useEffect(() => {
    if (optionsMetadata === undefined) {
      service.getGenerationOptionsMetadata().then((metadata) => {
        setOptionsMetadata(() => metadata);
        setOptions(() => new GenerationOptions(metadata));
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
        <Options
          metadata={optionsMetadata.ragDocs}
          getAndSet={optionGetterAndSetter('ragDocs', 'ragDocs')}
        />
      </div>
      <div className={'flex-container--horiz'}>
        <div className={'shadow-border flex-container__box padded'}>
          <h1>Settings</h1>
          {optionsMetadata.settings.map((setting) => (
            <div key={setting.name}>
              <h2>{setting.name}</h2>
              <Options
                metadata={setting}
                getAndSet={optionGetterAndSetter('settings', setting.name)}
              />
            </div>
          ))}
          <h1>Parameters</h1>
          {optionsMetadata.parameters.map((parameter) => (
            <div key={parameter.name}>
              <h2>{parameter.name}</h2>
              <Options
                metadata={parameter}
                getAndSet={optionGetterAndSetter('parameters', parameter.name)}
              />
            </div>
          ))}
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
            </>
          )}
        </div>
        <div className={'shadow-border flex-container__box--big padded'}>
          <h1>Custom Input</h1>
          {optionsMetadata.customInputs.map((customInput) => (
            <div key={customInput.name}>
              <h2>{customInput.name}</h2>
              <Options
                metadata={customInput}
                getAndSet={optionGetterAndSetter(
                  'customInputs',
                  customInput.name,
                )}
              />
            </div>
          ))}
          <h1>Output Formatting</h1>
          {optionsMetadata.outputOptions.map((outputOption) => (
            <div key={outputOption.name}>
              <span>{outputOption.name}: </span>
              <Options
                metadata={outputOption}
                getAndSet={optionGetterAndSetter(
                  'outputOptions',
                  outputOption.name,
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
