import '../common.css'
import {
    GenerationOptions,
    GenerationOptionsMetadata,
    GenerationServiceMockup,
    OptionMetadata,
} from "./GenerationService";
import {useEffect, useState} from "react";
import Markdown from "react-markdown";


const MultipleOptions = (props: {
    name: string,
    options: string[],
    getter: () => string[],
    setter: (v: any) => void
}) => {
    return <div>
        <span>{props.name}: </span>
        {props.options.map(option =>
            <span key={option}>
                            {option}
                <input type={"checkbox"} onChange={(event) => {
                    let picked = props.getter();
                    if (event.target.checked) {
                        picked.push(option)
                    } else {
                        picked = picked.filter(o => o !== option)
                    }
                    props.setter([...picked])
                }}/>
                        </span>)}
    </div>
}


const MultipleTextFields = (props: { name: string, getter: () => string[], setter: (v: any) => void }) => {
    return <div>
        <span>{props.name}</span>
        <br/>
        {props.getter().map((v, i) => <div key={i}>
            <input type={"text"} defaultValue={v} onChange={(event) => {
                let textFields = props.getter();
                textFields[i] = event.target.value;
                props.setter([...textFields])
            }}/>
        </div>)}
        <button onClick={() => props.setter([...props.getter(), ""])}>+</button>
    </div>
}


interface OptionsProps {
    name: string;
    metadata: OptionMetadata;
    getAndSet: [() => any, (value: any) => void]
}

const Options = ({name, metadata, getAndSet}: OptionsProps) => {
    let [get, set] = getAndSet;
    if (metadata === 'boolean') {
        return <div>
            <span>{name}</span>: <input type={"checkbox"} checked={get()}
                                        onChange={event => set(event.target.checked)}/>
        </div>
    } else if (metadata.type === "string") {
        if (metadata.options) {
            if (metadata.multiple) {
                return <MultipleOptions name={name} options={metadata.options} getter={get} setter={set}/>
            } else {
                return <div key={name}>
                    <span>{name}</span>
                    <br/>
                    {metadata.options.map(option => (
                        <div key={option}>
                            <label>{option}</label>
                            <input type={"radio"}
                                   name={name}
                                   checked={get() === option}
                                   onChange={() => set(option)}/>
                        </div>))}
                </div>
            }
        } else {
            if (metadata.multiple) {
                return <MultipleTextFields name={name} getter={get} setter={set}/>
            } else {
                return <div>
                    <span>{name}</span><br/><input type={"text"} onChange={(event) => set(event.target.value)}/><br/>
                </div>
            }

        }
    } else if (metadata.type === "number") {
        return <div>
            <span>{name}</span>
            <br/>
            <input type={"range"} value={get()} min={metadata.min} max={metadata.max} step={metadata.step}
                   onChange={(event) => set(event.target.value)}/>
        </div>
    } else {
        return <div>{name}: Unknown input</div>
    }
}

export const GeneratorPage = () => {
    let service = new GenerationServiceMockup();

    let [optionsMetadata, setOptionsMetadata] = useState<GenerationOptionsMetadata | undefined>(undefined);
    useEffect(() => {
        if (optionsMetadata === undefined) {
            service.getGenerationOptionsMetadata().then(
                result => {
                    setOptionsMetadata(result)
                }
            );
        }
    })

    let [options, setOptions] = useState<GenerationOptions>({
        customInputs: {inputs: [], instruction: ""},
        outputOptions: {bulletPoints: true},
        parameters: {
            communicationAndCollaboration: 3,
            digitalContentCreation: 3,
            informationAndDataLiteracy: 3,
            problemSolving: 3,
            safety: 3
        },
        ragDocs: [],
        settings: {educationName: "", educationalLevel: "Bachelor", faculty: "ARTS"}
    });
    const optionGetterAndSetter: (...keys: string[]) => [() => any, (v: any) => void] = (...keys: string[]) => {
        const getter: () => any = () => {
            // console.log("getting", keys)
            let current = options;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                current = current[key];
            }
            return current[keys[keys.length - 1]];
        }
        const setter: (v: any) => void = (value: any) => {
            // console.log("setting", keys, value)
            let updated: GenerationOptions = {...options};
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

    let [creatingResponse, setCreatingResponse] = useState(false);
    let [response, setResponse] = useState<string | undefined>(undefined);

    const createResponse = () => {
        setCreatingResponse(true);
        service.generate(options).then(
            responseString => {
                setResponse(responseString)
            }
        );
    }

    if (optionsMetadata === undefined) {
        return <div>Loading...</div>;
    }
    return <div className={"flex-container--vert"}>
        <div className={"shadow-border flex-container__box padded"}>
            <h1>Background documents</h1>
            <Options name={"RAG Documents"} metadata={optionsMetadata.ragDocs}
                     getAndSet={optionGetterAndSetter("ragDocs")}/>
        </div>
        <div className={"flex-container--horiz"}>
            <div className={"shadow-border flex-container__box padded"}>
                <h1>Settings</h1>
                <Options name={"Level"} metadata={optionsMetadata.settings.educationalLevel}
                         getAndSet={optionGetterAndSetter("settings", "educationalLevel")}/>
                <Options name={"Faculty"} metadata={optionsMetadata.settings.faculty}
                         getAndSet={optionGetterAndSetter("settings", "faculty")}/>
                <h1>Parameters</h1>
                <Options name={"Communication and Collaboration"}
                         metadata={optionsMetadata.parameters.communicationAndCollaboration}
                         getAndSet={optionGetterAndSetter("parameters", "communicationAndCollaboration")}/>
                <Options name={"Digital Content Creation"}
                         metadata={optionsMetadata.parameters.digitalContentCreation}
                         getAndSet={optionGetterAndSetter("parameters", "digitalContentCreation")}/>
                <Options name={"Information and Data Literacy"}
                         metadata={optionsMetadata.parameters.informationAndDataLiteracy}
                         getAndSet={optionGetterAndSetter("parameters", "informationAndDataLiteracy")}/>
                <Options name={"Safety"}
                         metadata={optionsMetadata.parameters.safety}
                         getAndSet={optionGetterAndSetter("parameters", "safety")}/>
                <Options name={"Problem Solving"}
                         metadata={optionsMetadata.parameters.problemSolving}

                         getAndSet={optionGetterAndSetter("parameters", "problemSolving")}/>

            </div>
            <div className={"shadow-border flex-container__box size_40percent padded"}>
                {(response && (<Markdown>{response}</Markdown>)) ||
                    (creatingResponse && <p>Creating response ...</p>) ||
                    <button onClick={createResponse}>Create</button>}

            </div>
            <div className={"shadow-border flex-container__box padded"}>
                <h1>Custom Input</h1>
                <Options name={"Extra inputs"}
                         metadata={optionsMetadata.customInputs.inputs}
                         getAndSet={optionGetterAndSetter("customInputs", "inputs")}/>
                <Options name={"Custom instruction"}
                         metadata={optionsMetadata.customInputs.instruction}
                         getAndSet={optionGetterAndSetter("customInputs", "instruction")}/>
                <h1>Output Formatting</h1>
                <Options name={"As bullet points"}
                         metadata={optionsMetadata.outputOptions.bulletPoints}
                         getAndSet={optionGetterAndSetter("outputOptions", "bulletPoints")}
                />
            </div>
        </div>

    </div>

}
