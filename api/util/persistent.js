/**
 * object which should be passed during the initialization for {@link DownstreamElectronFE#init}.
 * It should implements 2 methods for creating and removing the persistent session
 * @interface Persistent
 */

/**
 * should create a persistent session and resolve it with sessionId
 * @function
 * @name Persistent#createPersistentSession
 * @param {Persistent#PersistentConfig} config persistent config
 * @returns {Promise}
 */

/**
 * remove persistent session
 * @function
 * @param {string} sessionId session identifier
 * @name Persistent#removePersistentSession
 * @returns {Promise}
 */

/**
 * persistent config needed to be passed to {@link Persistent#createPersistentSession}
 * @name Persistent#PersistentConfig
 * @property {string} licenseUrl url to license server
 * @property {Uint8Array} serverCertificate server certificate
 * @property {string} [pssh] - protection information from manifest for widevine (ContentProtection), this is base64 string
 * if not provided it will be injected automatically by API
 * @property {object} [licenseRequest] - The callback function that will be triggered before the
 * [request]{@link https://developer.mozilla.org/pl/docs/XMLHttpRequest}, for example when you need to add request headers
 * @property {object} [licenseResponse] - The callback function that will be triggered with the
 * [request]{@link https://developer.mozilla.org/pl/docs/XMLHttpRequest}
 * @example
 * var config = {
 *   licenseUrl: 'https://lic.staging.drmtoday.com/license-proxy-widevine/cenc/',
 *   serverCertificate: new Uint8Array(<server_certificate>),
 *   licenseRequest: function ([request]{@link https://developer.mozilla.org/pl/docs/XMLHttpRequest}) {
 *     request.setRequestHeader('<headerParam>', '<headerValue>');
 *     .....
 *     request.setRequestHeader('Authorization', '........');
 *     request.setRequestHeader('dt-custom-data', '........');
 *   },
 *   licenseResponse: function ([request]{@link https://developer.mozilla.org/pl/docs/XMLHttpRequest}) {
 *     console.log(request.getAllResponseHeaders());
 *   }
 * };
 * @returns {Promise}
 */
