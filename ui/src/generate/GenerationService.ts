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
        try {
            const response = await fetch(
                "http://localhost:8000/generation_options_metadata"
            );

            return await response.json();
        } catch (error) {
            console.error("Failed to get options metadata:", error);
            throw error;
        }
    }

    async createPrompt(options: GenerationOptions): Promise<string> {
        try {
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

            const json = await response.json()
            return json;
        } catch (error) {
            console.error("Failed to generate:", error);
            throw error;
        }
    }

    async generate(options: GenerationOptions): Promise<string> {
        try {
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
        } catch (error) {
            console.error("Failed to generate:", error);
            throw error;
        }
    }

}