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
 * To enable Node.js integration in this file, open up `main.js`:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *    }
 *  });
 * ```
 */

import './index.css';

const downstreamInstance = window.downstreamElectronAPI.init(window);

downstreamInstance.downloads.create('https://demo.cf.castlabs.com/media/TOS/abr/Manifest_clean_sizes.mpd', '').then(function (result: any) {
    console.log(result);
    let manifestId = result.id;

    let representations = {
        video: [result.video[0].id],
        audio: [result.audio[0].id]
    };
    console.log(representations);

    downstreamInstance.downloads.start(result.id, representations).then(function () {
        downstreamInstance.downloads.subscribe(result.id, 1000, (error: any, stats: any) => {
            console.log(stats);
        }, (error: any, info: any) => {
            console.log(info);
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

console.log('👋 This message is being logged by "renderer.js", included via webpack');
