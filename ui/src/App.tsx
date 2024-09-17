import './App.scss';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router-dom';
import { GeneratorPage } from './generate/GeneratorPage';
import { getTextContentService } from './service/TextContentService';
import Markdown from 'react-markdown';
import { AdminPage } from './admin/AdminPage';

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
    getTextContentService()
      .get('about')
      .then((result) => setText(result));
  });

  return (
    // Delphinus defines a max width of some 60-70 chars for readability which
    // is why there is a specific max width for this piece of text for now
    <div className={'content-pane padded'} style={{ maxWidth: '70ch' }}>
      <h1>About</h1>
      <Markdown>{text}</Markdown>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app theme--blue">
        <Routes>
          {/* Main app nested route */}
          <Route
            element={
              <>
                <NavBar />
                <div className={'app__content'}>
                  <Outlet />
                </div>
              </>
            }
          >
            <Route index element={<GeneratorPage uiLevel={'Standard'} />} />
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
          </Route>
          {/* Admin route */}
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
