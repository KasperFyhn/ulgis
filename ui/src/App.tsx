import './App.css';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { GeneratorPage } from './generate/GeneratorPage';
import { EvaluationPage } from './evaluate/EvaluationPage';
import { UiLevel } from './generate/models';
import { MultiValueToggle } from './common/MultiValueToggle';

const UiLevelContext = createContext<{
  uiLevel: UiLevel;
  setUiLevel: (level: UiLevel) => void;
}>({
  uiLevel: 'simple',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUiLevel: () => {},
});

const UiLevelProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [uiLevel, setUiLevel] = useState<UiLevel>('standard');

  return (
    <UiLevelContext.Provider value={{ uiLevel, setUiLevel }}>
      {children}
    </UiLevelContext.Provider>
  );
};

export const useUiLevel: () => {
  uiLevel: UiLevel;
  setUiLevel: (level: UiLevel) => void;
} = () => useContext(UiLevelContext);

const NavBar: React.FC = () => {
  // TODO: create toggled sidebar instead of top navbar
  // const [showSidebar, setShowSidebar] = React.useState(false);

  const { uiLevel, setUiLevel } = useUiLevel();

  return (
    <header className={'navbar shadow-border'}>
      {/*<button*/}
      {/*  className={'sidebar-toggle'}*/}
      {/*  onClick={() => setShowSidebar(!showSidebar)}*/}
      {/*>*/}
      {/*  &equiv;*/}
      {/*</button>*/}
      <div className={'link-container'}>
        <Link to={'/'}>
          <span>
            <b>U</b>niversal <b>L</b>earning <b>G</b>oal <b>I</b>
            nspirational <b>S</b>ynthesizer
          </span>
        </Link>
        <Link to={'/generate'}>Generate</Link>
        <Link to={'/evaluate'}>Evaluate</Link>
        <Link to={'/about'}>About</Link>
        {/*{showSidebar && <div>SideBar</div>}*/}
      </div>

      <div className={'ui-level-selector'}>
        View:
        <MultiValueToggle
          name={'ui-level'}
          selected={uiLevel}
          onChange={(s) => {
            setUiLevel(s as UiLevel);
          }}
          options={['simple', 'standard', 'advanced']}
        />
      </div>
    </header>
  );
};

const FrontPage: React.FC = () => {
  return (
    <div className={'frontpage'}>
      <img src={'img.png'} alt={'ULGIS Logo'} />
      <p>
        Welcome to ULGIS. Go to the <Link to={'/generate'}>generate</Link> page
        to generate learning outcomes.
      </p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <UiLevelProvider>
        <NavBar />
        <div className="app">
          <div className={'app__content'}>
            <Routes>
              <Route path="/" element={<FrontPage />} />
              <Route path="/generate" element={<GeneratorPage />} />
              <Route path="/evaluate" element={<EvaluationPage />} />
              <Route path="/about" element={<p>Wow. Such empty.</p>} />
            </Routes>
          </div>
        </div>
      </UiLevelProvider>
    </BrowserRouter>
  );
};

export default App;
