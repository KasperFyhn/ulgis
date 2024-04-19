import './App.css';
import React from "react";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import {GeneratorPage} from "./generate/GeneratorPage";


const NavBar = () => {
    return <header className={"navbar shadow-border"}>
        <span>Outcome Synthesizer</span>
        <Link to={"/generate"}>Generate</Link>
        <Link to={"/evaluate"}>Evaluate</Link>
        <Link to={"/about"}>About</Link>
    </header>
}

const App = () => {
    return (
        <BrowserRouter>
            <NavBar/>
            <div className="app">
                <div className={"app__content"}>
                    <Routes>
                        <Route path="/" element={<p>Frontpage</p>}/>
                        <Route path="/generate" element={<GeneratorPage/>}/>
                        <Route path="/evaluate" element={<p>Evaluate</p>}/>
                        <Route path="/about" element={<p>Evaluate</p>}/>
                    </Routes>
                </div>

            </div>
        </BrowserRouter>

    );
}

export default App;
