import '../common.css'
import {GenerationOptions, GenerationOptionsMetadata, GenerationServiceMockup,} from "./GenerationService";
import React, {useEffect, useState} from "react";
import Markdown from "react-markdown";
import {Options} from "./Options";


export const GeneratorPage = () => {
    let service = new GenerationServiceMockup();

    let [optionsMetadata, setOptionsMetadata] = useState<GenerationOptionsMetadata | undefined>(undefined);

    let [options, setOptions] = useState<GenerationOptions | undefined>(undefined);
    const optionGetterAndSetter: (...keys: string[]) => [() => any, (v: any) => void] =
        (...keys: string[]) => {
            const getter: () => any = () => {
                let current = options!;
                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i];
                    current = current[key];
                }
                return current[keys[keys.length - 1]];
            }
            const setter: (v: any) => void = (value: any) => {
                let updated: GenerationOptions = {...options!};
                let current = updated;
                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i];
                    current = current[key];
                }
                current[keys[keys.length - 1]] = value;
                setOptions(updated);

            };
            return [getter, setter];
        };

    useEffect(() => {
        if (optionsMetadata === undefined) {
            service.getGenerationOptionsMetadata().then(
                metadata => {
                    setOptionsMetadata(() => metadata)
                    setOptions(() => new GenerationOptions(metadata))
                }
            );
        }
    })

    let [creatingResponse, setCreatingResponse] = useState(false);
    let [response, setResponse] = useState<string | undefined>(undefined);

    const createResponse = () => {
        setCreatingResponse(true);
        setResponse(() => "");
        service.generateAsStream(options!,
            (event: MessageEvent) => {
                setResponse((prevResponse) => prevResponse +
                    (event.data.toString()
                            .replaceAll("\\n", "\n")
                            .replaceAll("•", "-")
                    ));
            },
            () => setCreatingResponse(false));
    }

    const createPrompt = () => {
        setCreatingResponse(true);
        setResponse("Creating prompt ...");
        service.createPrompt(options!).then(
            prompt => {
                setResponse(prompt);
                setCreatingResponse(false);
            }
        );
    }

    if (optionsMetadata === undefined) {
        return <div>Loading...</div>;
    }
    return <div className={"flex-container--vert"}>
        <div className={"shadow-border flex-container__box padded"}>
            <h1>Taxonomies</h1>
            <Options metadata={optionsMetadata.ragDocs}
                     getAndSet={optionGetterAndSetter("ragDocs")}/>
        </div>
        <div className={"flex-container--horiz"}>
            <div className={"shadow-border flex-container__box padded"}>
                <h1>Settings</h1>
                {optionsMetadata.settings.map(
                    (setting, i) => <div key={setting.name}>
                        <h2>{setting.name}</h2>
                        <Options metadata={setting} getAndSet={optionGetterAndSetter("settings", setting.name)}/>
                    </div>
                )}
                <h1>Parameters</h1>
                {optionsMetadata.parameters.map(
                    (parameter, i) => <div key={parameter.name}>
                        <h2>{parameter.name}</h2>
                        <Options metadata={parameter} getAndSet={optionGetterAndSetter("parameters", parameter.name)}/>
                    </div>
                )}
            </div>
            <div className={"shadow-border flex-container__box size_40percent padded"}>
                {response && <Markdown>{response}</Markdown>}
                {creatingResponse && response === "" && <p>Connecting ...</p>}
                {!creatingResponse && (<>
                        <button onClick={createResponse}>Generate learning outcomes</button>
                        <button onClick={createPrompt}>Create prompt</button>
                    </>
                )}

            </div>
            <div className={"shadow-border flex-container__box--big padded"}>
                <h1>Custom Input</h1>
                {optionsMetadata.customInputs.map(
                    (customInput, i) => <div key={customInput.name}>
                        <h2>{customInput.name}</h2>
                        <Options metadata={customInput}
                                 getAndSet={optionGetterAndSetter("customInputs", customInput.name)}/>
                    </div>
                )}
                <h1>Output Formatting</h1>
                {optionsMetadata.outputOptions.map(
                    (outputOption, i) => <div key={outputOption.name}>
                        <span>{outputOption.name}: </span>
                        <Options metadata={outputOption}
                                 getAndSet={optionGetterAndSetter("outputOptions", outputOption.name)}/>
                    </div>
                )}
            </div>
        </div>

    </div>

}
