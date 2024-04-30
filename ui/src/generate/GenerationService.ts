export interface OptionMetadataBase {
    name: string
    initialValue?: any
}

export interface BooleanOptionMetadata extends OptionMetadataBase {
    type: "boolean";
}

export interface StringOptionMetadata extends OptionMetadataBase {
    type: "string";
    initialValue?: string
    options?: string[];
    short?: boolean;
}

export interface StringArrayOptionMetadata extends OptionMetadataBase {
    type: "stringArray";
    initialValue?: string[]
    options?: string[];
}

export interface NumberOptionMetadata extends OptionMetadataBase {
    type: "number";
    initialValue: number;
    min: number;
    max: number;
    step?: number;
}

export type OptionMetadata =
    BooleanOptionMetadata
    | StringOptionMetadata
    | StringArrayOptionMetadata
    | NumberOptionMetadata;

function initialValue(option: OptionMetadata): any {
    if (option.initialValue === undefined || option.initialValue === null) {
        if (option.type === "boolean") {
            return false;
        } else if (option.type === "string") {
            return "";
        } else if (option.type === "number") {
            return 0;
        } else if (option.type === "stringArray") {
            return [];
        }
    } else {
        return option.initialValue
    }
}


export interface GenerationOptionsMetadata {
    ragDocs: StringArrayOptionMetadata;
    settings: OptionMetadata[];
    parameters: OptionMetadata[];
    customInputs: OptionMetadata[];
    outputOptions: OptionMetadata[];
}

/**
 * Corresponds to app/models.py:GenerationOptions.
 */
export class GenerationOptions {
    [key: string]: any;

    ragDocs: string[]
    settings: any
    parameters: any
    customInputs: any
    outputOptions: any

    constructor(metadata: GenerationOptionsMetadata) {

        this.ragDocs = metadata.ragDocs.initialValue ?? [];
        this.settings = Object.fromEntries(metadata.settings.map(v => [v.name, initialValue(v)]))
        this.parameters = Object.fromEntries(metadata.parameters.map(v => [v.name, initialValue(v)]))
        this.customInputs = Object.fromEntries(metadata.customInputs.map(v => [v.name, initialValue(v)]))
        this.outputOptions = Object.fromEntries(metadata.outputOptions.map(v => [v.name, initialValue(v)]))
    }

}

export interface GenerationService {
    getGenerationOptionsMetadata(): Promise<GenerationOptionsMetadata>;

    generate(options: GenerationOptions): Promise<string>;
}

export class GenerationServiceMockup implements GenerationService {
    async getGenerationOptionsMetadata(): Promise<GenerationOptionsMetadata> {
        const response = await fetch(
            "http://localhost:8000/generation_options_metadata"
        );

        return await response.json();

    }

    async createPrompt(options: GenerationOptions): Promise<string> {

        const response = await fetch(
            "http://localhost:8000/create_prompt",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(options)
            }
        );

        return response.json()

    }

    async generate(options: GenerationOptions): Promise<string> {
        const response = await fetch(
            "http://localhost:8000/generate_outcomes",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(options)
            }
        );

        const json = await response.json();
        return json["response"];
    }

    generateAsStream(options: GenerationOptions,
                     onMessage: (event: MessageEvent<any>) => void,
                     onClose?: () => void): void {

        fetch(
            "http://localhost:8000/start_stream",
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(options)
            }
        ).then(
            response => {
                if (response.ok) {
                    response.json().then(
                        json => {
                            console.log("Successfully generated stream:", json)
                            const eventSource = new EventSource(
                                "http://localhost:8000/stream_response/" + json["token"]
                            );
                            eventSource.onmessage = onMessage;
                            eventSource.onerror = () => {
                                console.log("Closing event source.")
                                eventSource.close()
                                if (onClose) {
                                    onClose();
                                }
                            };
                        }
                    )
                } else {
                    throw new Error('Failed to generate stream');
                }
            }
        )
    }

}