import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.js';
import {LanguageProvider} from './i18n.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
    <LanguageProvider><App /></LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
