/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import * as downstreamElectron from 'downstream-electron/downstream-electron-fe';

const downstreamInstance = downstreamElectron.init(window);

/*
downstreamElectron.downloads.create('https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd', '').then(function (result: any) {
    console.log(result);
    let manifestId = result.id;

    let representations = {
        video: [result.video[0].id],
        audio: [result.audio[0].id]
    };
    console.log(representations);

    // downstreamElectron.downloads.createPersistent(result.id, persistentConfig).then(function (persistentSessionId) {
    //     console.log('persistent', persistentSessionId);
    // }, function (err: any) {
    //     console.log('persistent error', err);
    // });

    downstreamElectron.downloads.start(result.id, representations).then(function () {
        downstreamElectron.downloads.subscribe(result.id, 1000, () => {

        }, () => {

        }).then(function () {
            console.log('subscribed');
        }, function (err: any) {
            console.log('subscribed', err);
        });
    }, function (err: any) {
        console.log(result, err);
    });

}, function (err: any) {
    console.log(err);
});
*/

console.log('👋 This message is being logged by "renderer.js", included via webpack');
