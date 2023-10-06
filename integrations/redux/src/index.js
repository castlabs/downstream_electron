/**
 * 
 */
import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {downstreamStore} from './stores/rendererProcess';
import {Provider} from 'react-redux';
import App from './App';

/**
 * 
 */
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <Provider store={downstreamStore}>
        <App />
    </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
