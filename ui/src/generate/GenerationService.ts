import {
  GenerationOptions,
  GenerationOptionsMetadata,
  ObjectSchema,
  resolveSchema,
  SchemaRoot,
} from './models';

export interface GenerationService {
  getGenerationOptionsMetadata(): Promise<GenerationOptionsMetadata>;

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
        name: 'Taxonomies',
        description: 'Taxonomies to choose from',
        multiple: true,
        groups: {
          taxonomy1: {
            name: 'Taxonomy 1',
            description: 'Description of first Taxonomy 1',
            default: true,
            group: {
              parameter1: {
                name: 'Parameter 1',
                type: 'number',
                min: 1,
                max: 100,
                uiLevel: 'simple',
              },
            },
            uiLevel: 'simple',
          },
          taxonomy2: {
            name: 'Taxonomy 2',
            description: 'Description of first Taxonomy 1',
            default: true,
            group: {
              parameter1: {
                name: 'Parameter 1',
                type: 'number',
                min: 1,
                max: 100,
                uiLevel: 'simple',
              },
              parameter2: {
                name: 'Parameter 1',
                type: 'boolean',
                uiLevel: 'simple',
              },
            },
            uiLevel: 'advanced',
          },
        },
        uiLevel: 'simple',
      },

      customInputs: {
        name: 'Custom Inputs',
        default: true,
        group: {
          customInput: {
            name: 'Custom input',
            type: 'string',
            uiLevel: 'advanced',
          },
        },
        uiLevel: 'advanced',
      },
      outputOptions: {
        name: 'Output Options',
        description: 'Various output options',
        multiple: false,
        groups: {
          option1: {
            name: 'Option 1',
            description: 'Description of option 1',
            default: true,
            group: {
              parameter1: {
                name: 'Sub-option 1',
                type: 'number',
                min: 1,
                max: 100,
                uiLevel: 'simple',
              },
            },
            uiLevel: 'simple',
          },
          option2: {
            name: 'Option 2',
            description: 'Description of option 2',
            default: false,
            group: {
              parameter1: {
                name: 'Sub-option 1',
                type: 'number',
                min: 1,
                max: 100,
                uiLevel: 'simple',
              },
            },
            uiLevel: 'standard',
          },
        },
        uiLevel: 'simple',
      },

      settings: {
        name: 'Settings',
        group: {
          setting1: {
            name: 'Setting 1',
            type: 'string',
            options: ['1', '2', '3'],
            uiLevel: 'simple',
          },
        },
        uiLevel: 'simple',
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

  async getGenerationOptionsSchema(): Promise<ObjectSchema> {
    const response = await fetch(
      'http://localhost:8000/generation_options_schema',
    );

    return await response
      .json()
      .then((json: SchemaRoot) => resolveSchema(json));
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
        timeoutId = window.setTimeout(sendMessage, 50);
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

export class LocalGenerationService implements GenerationService {
  async getGenerationOptionsMetadata(): Promise<GenerationOptionsMetadata> {
    const response = await fetch(
      'http://localhost:8000/generation_options_metadata',
    );

    return await response.json();
  }

  async createPrompt(options: GenerationOptions): Promise<string> {
    const response = await fetch('http://localhost:8000/create_prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    return response.json();
  }

  async generate(options: GenerationOptions): Promise<string> {
    const response = await fetch('http://localhost:8000/generate_outcomes', {
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
    fetch('http://localhost:8000/start_stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    }).then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          console.log('Successfully generated stream:', json);
          const eventSource = new EventSource(
            'http://localhost:8000/stream_response/' + json['token'],
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
