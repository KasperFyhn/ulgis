import {OptionMetadata} from "./GenerationService";


const BooleanToggle = ({getAndSet}: {
    getAndSet: [() => boolean, (value: boolean) => void]
}) => {
    let [get, set] = getAndSet;
    return <input type={"checkbox"} checked={get()} onChange={event => set(event.target.checked)}/>
}


const StringOptions = ({options, getAndSet}: {
    options: string[];
    getAndSet: [() => string, (value: string) => void]
}) => {
    let [get, set] = getAndSet;
    let name: string = options.join("_");
    return <div>
        {options.map(option => (
            <div key={option}>
                <input type={"radio"}
                       name={name}
                       checked={get() === option}
                       onChange={() => set(option)}/>
                <label>{option}</label>
            </div>))}
    </div>
}


const MultipleStringOptions = ({options, getAndSet}: {
    options: string[];
    getAndSet: [() => string[], (value: string[]) => void]
}) => {
    let [get, set] = getAndSet;
    return <div className={"flex-container--horiz"}>
        {options.map(option =>
            <span key={option}>
                <input type={"checkbox"} onChange={(event) => {
                    let picked = get();
                    if (event.target.checked) {
                        picked.push(option)
                    } else {
                        picked = picked.filter(o => o !== option)
                    }
                    set([...picked])
                }}/>
                {option}
            </span>)}
    </div>
}

const TextField  = ({short, getAndSet}: {
    short: boolean,
    getAndSet: [() => string, (value: string) => void]
}) => {
    let [get, set] = getAndSet;
    if (short) {
        return <input type={"text"} value={get()} onChange={(event) => set(event.target.value)}/>
    } else {
            return <div className={"flex-container--vert"}>
        <textarea value={get()} onChange={(event) => set(event.target.value)}/>
    </div>
    }

}

const MultipleTextFields = (props: { getter: () => string[], setter: (v: any) => void }) => {
    return <div className={"flex-container--vert"}>
        {props.getter().map(
            (v, i) =>
                <textarea key={i} value={v} onChange={(event) => {
                    let textFields = props.getter();
                    textFields[i] = event.target.value;
                    props.setter([...textFields])
                }}/>)
        }
        <button onClick={() => props.setter([...props.getter(), ""])}>+</button>
    </div>
}

const NumberSlider = ({min, max, step, getAndSet}: {
    min: number;
    max: number;
    step: number;
    getAndSet: [() => number, (value: number) => void];
}) => {
    let [get, set] = getAndSet;
    return <div>
        <input type={"range"} value={get()} min={min} max={max} step={step}
               onChange={(event) => set(Number(event.target.value))}/>
    </div>
}

interface OptionsProps {
    metadata: OptionMetadata;
    getAndSet: [() => any, (value: any) => void]
}


export const Options = ({metadata, getAndSet}: OptionsProps) => {
    let [get, set] = getAndSet;
    if (metadata.type === 'boolean') {
        return <BooleanToggle getAndSet={getAndSet}/>
    } else if (metadata.type === "string") {
        if (metadata.options) {
            return <StringOptions options={metadata.options} getAndSet={getAndSet}/>
        } else {
            return <TextField short={metadata.short ?? false} getAndSet={getAndSet} />
        }
    } else if (metadata.type === "stringArray") {
        if (metadata.options) {
            return <MultipleStringOptions options={metadata.options} getAndSet={getAndSet}/>
        } else {
            return <MultipleTextFields getter={get} setter={set}/>
        }
    } else if (metadata.type === "number") {
        return <NumberSlider min={metadata.min} max={metadata.max} step={metadata.step ?? 1}
                             getAndSet={getAndSet}/>
    } else {
        return <div>Unknown input</div>
    }
}