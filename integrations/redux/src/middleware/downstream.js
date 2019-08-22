/**
 * 
 */
const fakePersistentSessionId = 'fake_';

/**
 * 
 */
function FakePersistentPlugin() {
    this.createPersistentSession = (persistentConfig) => {
        console.log('create - call of fake persistent plugin, persistentConfig', persistentConfig);
        return new Promise((resolve) => {
            setTimeout(() => {
                const sessionId = fakePersistentSessionId + Math.random();
                console.log('create - call of fake persistent plugin resolved', sessionId);
                resolve(sessionId);
            }, 1000);
        });
    };

    this.removePersistentSession = (sessionId) => {
        console.log('remove - call of fake persistent plugin, sessionId', sessionId);
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('remove - call of fake persistent plugin resolved', sessionId);
                resolve();
            }, 1000);
        });
    };
}

/**
 * 
 */
const downstreamElectron = require('downstream-electron').init(window, new FakePersistentPlugin());

/**
 * 
 * @param {*} store 
 */
export const downstreamMiddleware = store => next => action => {
    switch (action.type) {
        //
        case 'DOWNSTREAM_CREATE':
            downstreamElectron.downloads.create(action.url, action.id).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_CREATE_PERSISTENT':
            downstreamElectron.downloads.createPersistent(action.id, action.persistentConfig).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_GET_FOLDER_INFO':
            downstreamElectron.downloads.getFolderInfo(action.id).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_GET_LIST':
            downstreamElectron.downloads.getList().then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_GET_LIST_WITH_INFO':
            downstreamElectron.downloads.getListWithInfo().then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_GET_OFFLINE_LINK':
            downstreamElectron.downloads.getOfflineLink(action.id).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_INFO':
            downstreamElectron.downloads.info(action.id).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_REMOVE':
            downstreamElectron.downloads.remove(action.id).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_REMOVE_ALL':
            downstreamElectron.downloads.removeAll().then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_REMOVE_ALL_UNFINISHED':
            downstreamElectron.downloads.removeAllUnfinished().then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_REMOVE_PERSISTENT':
            downstreamElectron.downloads.removePersistent(action.id).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_RESUME':
            downstreamElectron.downloads.resume(action.id).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_SAVE_DATA':
            downstreamElectron.downloads.saveData(action.id, action.data).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_SAVE_PERSISTENT':
            downstreamElectron.downloads.savePersistent(action.id, action.persistent).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_START':
            downstreamElectron.downloads.start(action.id, action.representations, action.customFolder).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_STOP':
            downstreamElectron.downloads.stop(action.id).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_STOP_ALL':
            downstreamElectron.downloads.stopAll().then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_SUBSCRIBE':
            downstreamElectron.downloads.subscribe(action.id, action.timeout, action.onProgress, action.onFinish).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_UNSUBSCRIBE':
            downstreamElectron.downloads.unsubscribe(action.id).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        //
        case 'DOWNSTREAM_UPDATE_DOWNLOAD_FOLDER':
            downstreamElectron.downloads.updateDownloadFolder(action.id, action.path).then((result) => {
                defaultSuccessHandler(next, action, result);
            }, (error) => {
                defaultErrorHandler(next, action, error);
            });
            break;

        default:
            next(action);
    }
}

/**
 * 
 * @param {*} next 
 * @param {*} action 
 * @param {*} result 
 */
function defaultSuccessHandler(next, action, result) {
    action.result = result;
    next(action);
}

/**
 * 
 * @param {*} next 
 * @param {*} action 
 * @param {*} error 
 */
function defaultErrorHandler(next, action, error) {
    action.error = error;
    next(action);
}
