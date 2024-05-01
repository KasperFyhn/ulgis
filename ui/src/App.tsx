import './App.css';
import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { GeneratorPage } from './generate/GeneratorPage';
import { EvaluationPage } from './evaluate/EvaluationPage';
import { ExpandableContainer } from './common/ExpandableContainer';

const NavBar: React.FC = () => {
  return (
    <header className={'navbar shadow-border'}>
      <span>Outcome Synthesizer</span>
      <Link to={'/generate'}>Generate</Link>
      <Link to={'/evaluate'}>Evaluate</Link>
      <Link to={'/test'}>Test</Link>
      <Link to={'/about'}>About</Link>
    </header>
  );
};

const TestPage: React.FC = () => {
  return (
    <div>
      <ExpandableContainer
        className={'shadow-border padded'}
        header={<h2>test</h2>}
      >
        <p>Hello there</p>
        <p>How are you?</p>
      </ExpandableContainer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="app">
        <div className={'app__content'}>
          <Routes>
            <Route path="/" element={<p>Frontpage</p>} />
            <Route path="/generate" element={<GeneratorPage />} />
            <Route path="/evaluate" element={<EvaluationPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/about" element={<p>Evaluate</p>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
