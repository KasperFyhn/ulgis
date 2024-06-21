import './App.scss';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { GeneratorPage } from './generate/GeneratorPage';
import { DefaultTextContentService } from './TextContentService';

const NavBar: React.FC = () => {
  return (
    <nav className={'nav nav--site-nav theme--dark'}>
      <Link className={'nav__home home-title'} to={'/'}>
        <b>U</b>niversal <b>L</b>earning <b>G</b>oal <b>I</b>
        nspirational <b>S</b>ynthesizer
      </Link>

      <div className={'nav__site'}>
        <div className={'nav__items'}>
          <Link className={'nav__item'} to={'/standard'}>
            Standard
          </Link>
          <Link className={'nav__item'} to={'/modular'}>
            Modular
          </Link>
          {/*<Link className={'nav__item'} to={'/ample'}>*/}
          {/*  Ample*/}
          {/*</Link>*/}
        </div>
        <Link className={'nav__item'} to={'/about'}>
          About
        </Link>
      </div>
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
  return (
    <BrowserRouter>
      <NavBar />
      <div className="app theme--blue">
        <div className={'app__content'}>
          <Routes>
            <Route path="/" element={<GeneratorPage uiLevel={'Standard'} />} />
            <Route
              path="/standard"
              element={<GeneratorPage uiLevel={'Standard'} />}
            />
            <Route
              path="/modular"
              element={<GeneratorPage uiLevel={'Modular'} />}
            />
            <Route
              path="/ample"
              element={<GeneratorPage uiLevel={'Ample'} />}
            />
            {/*<Route path="/evaluate" element={<EvaluationPage />} />*/}
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="*"
              element={
                <div className={'content-pane padded'}>
                  <h1>Not found</h1>
                  <p>This is not the page you are looking for.</p>
                  <p>You can go about your business.</p>
                  <p>Move along.</p>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
