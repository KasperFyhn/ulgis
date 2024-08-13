import React, { useState } from 'react';
import { GenerationOptions } from './models';
import { Notification } from '../common/Notification';
import { GenerationService } from './GenerationService';
import { CopyableMarkdown } from '../common/CopyableMarkdown';
import Markdown from 'react-markdown';

export interface GenerationPaneProps {
  generationOptions: GenerationOptions;
  service: GenerationService;
}

export const GenerationPane: React.FC<GenerationPaneProps> = ({
  generationOptions,
  service,
}: GenerationPaneProps) => {
  const [activeResponse, setActiveResponse] = useState<string | undefined>(
    undefined,
  );
  const [atResponse, setAtResponse] = useState<number>(0);
  const [responses, setResponses] = useState<string[]>([]);

  const createResponse = (): void => {
    setActiveResponse('');

    service.generateAsStream(
      generationOptions,
      (event) => {
        setActiveResponse(
          (prevState) =>
            prevState +
            event.data.toString().replaceAll('\\n', '\n').replaceAll('•', '-'),
        );
      },
      () => {
        setActiveResponse((prevState) => {
          if (prevState) {
            setResponses((prevResponses) => prevResponses.concat(prevState));
          }
          return undefined;
        });
      },
    );

    setAtResponse(responses.length);
  };

  const createPrompt = (): void => {
    service.createPrompt(generationOptions).then((prompt) => {
      setResponses((prevResponses) => prevResponses.concat(prompt));
      setAtResponse(responses.length);
    });
  };

  // for controlling whether help and disclaimer messages have been dismissed
  const [helpDismissed, setHelpDismissed] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);

  return (
    <div
      className={'content-pane flex-container__box size_40percent padded'}
      // Delphinus defines a max width of some 60-70 chars for readability which
      // is why there is a specific max width for this piece of text for now
      style={{ maxWidth: '70ch' }}
    >
      {responses.length <= 0 && !activeResponse && !helpDismissed && (
        <Notification
          fetchKey={'help'}
          onDismiss={() => setHelpDismissed(true)}
        />
      )}
      {(responses.length > 0 || activeResponse) && !disclaimerDismissed && (
        <Notification
          fetchKey={'disclaimer'}
          type={'attention'}
          onDismiss={() => setDisclaimerDismissed(true)}
        />
      )}
      {
        <div className={'button-container'}>
          {/*TODO: the visually-disabled class only works by setting the it in
          code, not by extending all the class in CSS. :( */}
          <button
            className={'visually-disabled'}
            onClick={createResponse}
            disabled={activeResponse !== undefined}
          >
            Run prompt on ULGIS
          </button>
          <button
            className={'visually-disabled'}
            onClick={createPrompt}
            disabled={activeResponse !== undefined}
          >
            Create prompt
          </button>
          <button
            className={
              'visually-disabled button--icon button--text icon-previous'
            }
            disabled={atResponse <= 0 || activeResponse !== undefined}
            onClick={() =>
              setAtResponse((prevAtResponse) => prevAtResponse - 1)
            }
          />
          <button
            className={
              'visually-disabled button--icon button--icon--right ' +
              'button--text icon-next '
            }
            disabled={
              atResponse >= responses.length - 1 || activeResponse !== undefined
            }
            onClick={() =>
              setAtResponse((prevAtResponse) => prevAtResponse + 1)
            }
          />
        </div>
      }
      {/*When there is no active response (i.e. one being generated), the
       text should be copyable and there can be buttons in the bottom.*/}
      {activeResponse === undefined && responses.length > 0 && (
        <CopyableMarkdown text={responses[atResponse]} />
      )}
      {activeResponse === undefined &&
        responses.length > 0 &&
        responses[atResponse].length > 500 && (
          <div className={'button-container'}>
            <button onClick={createResponse}>Run prompt on ULGIS</button>
            <button onClick={createPrompt}>Create prompt</button>
          </div>
        )}

      {activeResponse === '' && <p>Connecting ...</p>}
      {activeResponse && <Markdown>{activeResponse}</Markdown>}
    </div>
  );
};
