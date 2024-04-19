export interface OptionBase {
    type: "string" | "number" | "boolean";
}

export interface StringOption extends OptionBase {
    type: "string";
    multiple?: boolean;
    options?: string[];
}

export interface NumberOption extends OptionBase {
    type: "number";
    min: number;
    max: number;
    step?: number;
}

export type OptionMetadata = StringOption | NumberOption | "boolean";


export interface GenerationOptionsMetadata {
    ragDocs: OptionMetadata;
    settings: {
        educationalLevel: OptionMetadata;
        faculty: OptionMetadata;
    };
    parameters: {
        problemSolving: OptionMetadata;
        informationAndDataLiteracy: OptionMetadata;
        communicationAndCollaboration: OptionMetadata;
        digitalContentCreation: OptionMetadata;
        safety: OptionMetadata;

    };
    customInputs: {
        inputs: OptionMetadata;
        instruction: OptionMetadata;
    };
    outputOptions: {
        bulletPoints: OptionMetadata;
    };
}

/**
 * Corresponds to backend/models.py:GenerationOptions.
 */
export interface GenerationOptions {
    [key: string]: any;

    ragDocs: string[];
    settings: {
        educationalLevel: string,
        faculty: string,
        educationName: string
    }
    parameters: {
        problemSolving: number,
        informationAndDataLiteracy: number,
        communicationAndCollaboration: number,
        digitalContentCreation: number,
        safety: number

    },
    customInputs: {
        inputs: string[],
        instruction: string
    }
    outputOptions: {
        bulletPoints: boolean
    }
}

export interface GenerationService {
    getGenerationOptionsMetadata(): Promise<GenerationOptionsMetadata>;

    generate(options: GenerationOptions): Promise<string>;
}

export class GenerationServiceMockup implements GenerationService {
    getGenerationOptionsMetadata(): Promise<GenerationOptionsMetadata> {
        let returnValue: GenerationOptionsMetadata = {
            ragDocs: {
                type: "string",
                multiple: true,
                options: ["Document 1", "Document 2", "Document 3", "Document 4"]
            },
            settings: {
                educationalLevel: {
                    type: "string",
                    options: ["Bachelor", "Master", "PhD"]
                },
                faculty: {
                    type: "string",

                    options: ["ARTS", "NAT", "TECH", "BSS", "HEALTH"]
                }
            },
            parameters: {
                communicationAndCollaboration: {
                    type: "number",
                    min: 1,
                    max: 5,
                },
                digitalContentCreation: {
                    type: "number",
                    min: 1,
                    max: 5,
                },
                informationAndDataLiteracy: {
                    type: "number",
                    min: 1,
                    max: 5,
                },
                problemSolving: {
                    type: "number",
                    min: 1,
                    max: 5,
                },
                safety: {
                    type: "number",
                    min: 1,
                    max: 5,
                }

            },
            customInputs: {
                inputs: {
                    type: "string",
                    multiple: true
                },
                instruction: {
                    type: "string"
                }
            },
            outputOptions: {
                bulletPoints: 'boolean'
            }
        }

        return Promise.resolve(returnValue);
    }

    async generate(options: GenerationOptions | {}): Promise<string> {
        try {
            console.log(options)
            const response = await fetch(
                "http://localhost:8000/generate_outcomes",
                {
                    method: 'POST', // Specify the method explicitly
                    headers: {
                        'Content-Type': 'application/json' // Set the Content-Type header
                    },
                    body: JSON.stringify(options) // Stringify the body payload
                }
            );

            const json = await response.json();
            return json["response"];
        } catch (error) {
            console.error("Failed to generate:", error);
            throw error; // Rethrow the error after logging or handling it
        }
    }

}