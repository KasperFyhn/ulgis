import './App.scss';
import React from 'react';
import { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router-dom';
import { GeneratorPage } from './generate/GeneratorPage';
import { AdminPage } from './admin/AdminPage';
import { NotFoundPage } from './common/NotFoundPage';
import { AboutPage } from './AboutPage';

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

const MainLayout: React.FC = () => {
  return (
    <>
      <NavBar />
      <div className={'app__content'}>
        <Outlet />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app theme--blue">
        <Routes>
          {/* Main app nested route */}
          <Route element={<MainLayout />}>
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
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          {/* Admin route */}
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
