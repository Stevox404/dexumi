import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DecoratedApp from 'DecoratedApp';
import { setProxy } from 'mangadex-full-api';

const PORT = DEV_PROXY_PORT || window.PROXY_PORT;

if (PORT) {
    setProxy({
        hostname: 'localhost',
        port: PORT,
        path: '/cors-proxy/'
    });
}


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