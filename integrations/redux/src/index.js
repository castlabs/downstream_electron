import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Redux from 'redux';
import rootReducer from './reducers';

const store = createStore(rootReducer);
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

/*
'create',
'createPersistent',
'getFolderInfo',
'getList',
'getListWithInfo',
'getOfflineLink',
'info',
'remove',
'removeAll',
'removeAllUnfinished',
'removePersistent',
'resume',
'saveData',
'savePersistent',
'start',
'stop',
'stopAll',
'subscribe',
'unsubscribe',
'updateDownloadFolder'
*/
