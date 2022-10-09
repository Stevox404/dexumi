import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import DecoratedApp from 'DecoratedApp';
import * as serviceWorker from './serviceWorker';
import { setProxy } from 'mangadex-full-api';

setProxy({
    url: 'localhost',
    port: '8080'
});

ReactDOM.render(
  <React.StrictMode>
    <DecoratedApp />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();


// serviceWorker.register();