import './App.scss';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { GeneratorPage } from './generate/GeneratorPage';
import { UiLevel } from './generate/models';
import { MultiValueToggle } from './common/MultiValueToggle';
import { DefaultTextContentService } from './TextContentService';

export const UiLevelContext = createContext<{
  uiLevel: UiLevel;
  setUiLevel: (level: UiLevel) => void;
}>({
  uiLevel: 'Standard',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUiLevel: () => {},
});

const UiToggleButton: React.FC = () => {
  const { uiLevel, setUiLevel } = useContext(UiLevelContext);
  return (
    <div className={'nav__item'}>
      <span>Mode: </span>
      <MultiValueToggle
        name={'ui-level'}
        selected={uiLevel}
        onChange={(s) => {
          setUiLevel(s as UiLevel);
        }}
        options={['Standard', 'Modular', 'Ample']}
      />
    </div>
  );
};

const NavBar: React.FC = () => {
  // FIXME: The UI mode toggle button does not really behave on narrow devices
  //  when only rendered under a 'nav__utilities'. Therefore this hack where
  //  it is rendered differently depending on width of the browser

  const [narrowWindow, setNarrowWindow] = useState<boolean>(
    window.innerWidth < 800,
  );
  window.addEventListener('resize', () =>
    setNarrowWindow(window.innerWidth < 800),
  );

  return (
    <nav className={'nav nav--site-nav theme--dark'}>
      <Link className={'nav__home home-title'} to={'/'}>
        <b>U</b>niversal <b>L</b>earning <b>G</b>oal <b>I</b>
        nspirational <b>S</b>ynthesizer
      </Link>

      <div className={'nav__site'}>
        <div className={'nav__items'}>
          <Link className={'nav__item'} to={'/about'}>
            About
          </Link>
        </div>
        {narrowWindow && <UiToggleButton />}
      </div>

      {!narrowWindow && (
        <div className={'nav__utilities'}>
          <UiToggleButton />
        </div>
      )}
    </nav>
  );
};

const AboutPage = (): React.JSX.Element => {
  const [text, setText] = useState<string>('Loading ...');

  useEffect(() => {
    new DefaultTextContentService()
      .get('about')
      .then((result) => setText(result));
  });

  return (
    // Delphinus defines a max width of some 60-70 chars for readability which
    // is why there is a specific max width for this piece of text for now
    <div className={'content-pane padded'} style={{ maxWidth: '70ch' }}>
      <h1>About</h1>
      {text.split('\n\n').map((paragraph) => (
        <p key={paragraph.slice(0, 20)}>{paragraph}</p>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [uiLevel, setUiLevel] = useState<UiLevel>('Standard');

  return (
    <BrowserRouter>
      <UiLevelContext.Provider value={{ uiLevel, setUiLevel }}>
        <NavBar />
        <div className="app theme--blue">
          <div className={'app__content'}>
            <Routes>
              <Route path="/" element={<GeneratorPage />} />
              {/*<Route path="/evaluate" element={<EvaluationPage />} />*/}
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </div>
        </div>
      </UiLevelContext.Provider>
    </BrowserRouter>
  );
};

export default App;
