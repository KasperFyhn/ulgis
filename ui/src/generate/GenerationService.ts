export type OptionType = boolean | string | number | string[];

export interface OptionMetadataBase<T extends OptionType> {
  name: string;
  initialValue?: T;
}

export interface BooleanOptionMetadata extends OptionMetadataBase<boolean> {
  type: 'boolean';
}

export interface StringOptionMetadata extends OptionMetadataBase<string> {
  type: 'string';
  options?: string[];
  short?: boolean;
}

export interface StringArrayOptionMetadata
  extends OptionMetadataBase<string[]> {
  type: 'stringArray';
  options?: string[];
}

export interface NumberOptionMetadata extends OptionMetadataBase<number> {
  type: 'number';
  min: number;
  max: number;
  step?: number;
}

export type OptionMetadata =
  | BooleanOptionMetadata
  | StringOptionMetadata
  | StringArrayOptionMetadata
  | NumberOptionMetadata;

function getInitialValue(option: OptionMetadata): OptionType {
  if (option.initialValue === undefined || option.initialValue === null) {
    switch (option.type) {
      case 'boolean':
        return false;
      case 'number':
        return 0;
      case 'string':
        return '';
      case 'stringArray':
        return [];
    }
  } else {
    return option.initialValue;
  }
}

export interface GenerationOptionsMetadata {
  ragDocs: StringArrayOptionMetadata;
  settings: OptionMetadata[];
  parameters: OptionMetadata[];
  customInputs: OptionMetadata[];
  outputOptions: OptionMetadata[];
}

export class GenerationSubOptions {
  [key: string]: OptionType;
}

export class GenerationOptions {
  [key: string]: GenerationSubOptions;

  ragDocs: GenerationSubOptions = {};
  settings: GenerationSubOptions = {};
  parameters: GenerationSubOptions = {};
  customInputs: GenerationSubOptions = {};
  outputOptions: GenerationSubOptions = {};

  constructor(metadata?: GenerationOptionsMetadata) {
    if (metadata !== undefined) {
      this.ragDocs = { ragDocs: metadata.ragDocs.initialValue ?? [] };
      this.settings = Object.fromEntries(
        metadata.settings.map((v) => [v.name, getInitialValue(v)]),
      );
      this.parameters = Object.fromEntries(
        metadata.parameters.map((v) => [v.name, getInitialValue(v)]),
      );
      this.customInputs = Object.fromEntries(
        metadata.customInputs.map((v) => [v.name, getInitialValue(v)]),
      );
      this.outputOptions = Object.fromEntries(
        metadata.outputOptions.map((v) => [v.name, getInitialValue(v)]),
      );
    }
  }
}

export interface GenerationService {
  getGenerationOptionsMetadata(): Promise<GenerationOptionsMetadata>;

  generate(options: GenerationOptions): Promise<string>;
}

export class GenerationServiceMockup implements GenerationService {
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
