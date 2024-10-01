import {
  GenerationOptions,
  GenerationOptionsMetadata,
  UiLevel,
} from '../generate/models';
import { DefaultServiceBase } from './ServiceBase';
import { ServiceProvider } from './ServiceProvider';

export interface GenerationService {
  getGenerationOptionsMetadata(
    uiLevel: UiLevel,
  ): Promise<GenerationOptionsMetadata>;

  createPrompt(options: GenerationOptions): Promise<string>;

  generate(options: GenerationOptions): Promise<string>;

  generateAsStream(
    options: GenerationOptions,
    onMessage: (event: MessageEvent<string>) => void,
    onClose?: () => void,
  ): void;
}

export class MockGenerationService implements GenerationService {
  getGenerationOptionsMetadata(): Promise<GenerationOptionsMetadata> {
    const generationOptions: GenerationOptionsMetadata = {
      taxonomies: {
        type: 'toggledOptionGroupArray',
        name: 'Taxonomies',
        description: 'Taxonomies to choose from',
        multiple: true,
        groups: {
          taxonomy1: {
            type: 'toggledOptionGroup',
            name: 'Taxonomy 1',
            description: 'Description of first Taxonomy 1',
            default: true,
            group: {
              parameter1: {
                name: 'Parameter 1',
                type: 'number',
                min: 1,
                max: 100,
              },
            },
          },
          taxonomy2: {
            type: 'toggledOptionGroup',
            name: 'Taxonomy 2',
            description: 'Description of first Taxonomy 1',
            default: true,
            group: {
              parameter1: {
                name: 'Parameter 1',
                type: 'number',
                min: 1,
                max: 100,
              },
              parameter2: {
                name: 'Parameter 1',
                type: 'boolean',
              },
            },
          },
        },
      },

      customInputs: {
        type: 'optionGroup',

        name: 'Custom Inputs',
        group: {
          customInput: {
            name: 'Custom input',
            type: 'string',
          },
        },
      },
      outputOptions: {
        type: 'toggledOptionGroupArray',

        name: 'Output Options',
        description: 'Various output options',
        multiple: false,
        groups: {
          option1: {
            type: 'toggledOptionGroup',

            name: 'Option 1',
            description: 'Description of option 1',
            default: true,
            group: {
              parameter1: {
                name: 'Sub-option 1',
                type: 'number',
                min: 1,
                max: 100,
              },
            },
          },
          option2: {
            type: 'toggledOptionGroup',

            name: 'Option 2',
            description: 'Description of option 2',
            default: false,
            group: {
              parameter1: {
                name: 'Sub-option 1',
                type: 'number',
                min: 1,
                max: 100,
              },
            },
          },
        },
      },

      educationInfo: {
        type: 'optionGroup',

        name: 'Settings',
        group: {
          setting1: {
            name: 'Setting 1',
            type: 'string',
            options: ['1', '2', '3'],
          },
        },
      },
    };
    return Promise.resolve(generationOptions);
  }

  createPrompt(options: GenerationOptions): Promise<string> {
    return Promise.resolve(
      'This prompt is from a mock generation service. Options:\n\n' +
        JSON.stringify(options, null, 2).replaceAll('\n', '\n\n\t'),
    );
  }

  generate(options: GenerationOptions): Promise<string> {
    return Promise.resolve(
      'This response is from a mock generation service. Options:\n\n\t' +
        JSON.stringify(options, null, 2).replaceAll('\n', '\n\n\t'),
    );
  }

  generateAsStream(
    options: GenerationOptions,
    onMessage: (event: MessageEvent<string>) => void,
    onClose?: () => void,
  ): void {
    const responseChunks = (
      'This response is from a mock generation service. Options:\n\n\t' +
      JSON.stringify(options, null, 2).replaceAll('\n', '\n\n\t')
    ).split(' ');
    let index = 0;
    let timeoutId: number;
    const sendMessage: () => void = () => {
      if (index < responseChunks.length) {
        // Simulate sending a message every 0.5 seconds
        const message = responseChunks[index] + ' ';
        onMessage(new MessageEvent('message', { data: message }));
        index++;
        timeoutId = window.setTimeout(sendMessage, 10);
      } else {
        if (onClose) {
          onClose();
        }
        window.clearTimeout(timeoutId);
      }
    };
    timeoutId = window.setTimeout(sendMessage, 500);
  }
}

export class DefaultGenerationService
  extends DefaultServiceBase
  implements GenerationService
{
  async getGenerationOptionsMetadata(
    uiLevel: UiLevel,
  ): Promise<GenerationOptionsMetadata> {
    const response = await fetch(
      this.url + 'generate/generation_options_metadata/' + uiLevel,
    );

    return await response.json();
  }

  async createPrompt(options: GenerationOptions): Promise<string> {
    const response = await fetch(this.url + 'generate/create_prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    return response.json();
  }

  async generate(options: GenerationOptions): Promise<string> {
    const response = await fetch(this.url + 'generate/generate_response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const json = await response.json();
    return json['response'];
  }

  generateAsStream(
    options: GenerationOptions,
    onMessage: (event: MessageEvent<string>) => void,
    onClose?: () => void,
  ): void {
    fetch(this.url + 'generate/start_stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    }).then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          console.log('Successfully generated stream:', json);
          const eventSource = new EventSource(
            this.url + 'generate/stream_response/' + json['token'],
          );
          eventSource.onmessage = onMessage;
          eventSource.onerror = () => {
            console.log('Closing event source.');
            eventSource.close();
            if (onClose) {
              onClose();
            }
          };
        });
      } else {
        throw new Error('Failed to generate stream');
      }
    });
  }
}

const provider = new ServiceProvider<GenerationService>(
  MockGenerationService,
  DefaultGenerationService,
);

export function getGenerationService(): GenerationService {
  return provider.get();
}
