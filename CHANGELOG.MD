# 0.5.0
 * Added Node.js v14 LTS Support
 * Added Electron 9 support
 * Updated dependencies
 * Removed UglifyJs and use TerserJs as a default minimizer
 * Moved from `master` branch to `main` branch
 * Fixed manifest saving issue (only `undefined` string was stored)
 * Dropped Node.js v8 support

# 0.4.0
 * Monitor key session state and detect downloaded stream with persistent license
 * Node.js v10 LTS Support
 * Packaging and production-ready libraries
 * Fix video, audio and text representations parsing
 * DRM example improvements
 * Do not require objects from main process in child process
 * Update Electron version
 * Redux integration
 * Change CI to GitHub Actions

# 0.3.5
 * Simple Widevine DRM example
 * Add a string parameter to let application give the manifest data
 * Update project structure and upgrade Electron version to 4.0.1 WV VMP by castLabs
 * Add an error message on loadFromLocal rejection

# 0.3.4
 * Update main process usage documentation
 * Simplify build testing steps
 * Fix distribution startup issue with child process script localization

# 0.3.3
 * Add force no cache for downloads preference
 * Release all DownloadStats on stop kept in _statsPrevious
 * Add stop on download error preference

# 0.3.2
 * Improve manifest download handling by checking status
 * Fix comparison of local files issues on Windows
 * Stop HTTP server process when application is quitting

# 0.3.1
 * Start HTTP server as a child process
 * Improve download errors handling
 * Make sure resume method use correct last status of download
 * Update settings types in documentation
 * Fix download status setting in startQueue

# 0.3.0
 * Download fragments without head functionality
 * Improved download process 
 * Implements seek during download
 * Handling not enough space error
 * Upgrade dependencies
 * Download content to custom folder
 * Previous license removal error handling
 * Queued status for manifest downloads

# 0.2.9
 * Optional chunked encoding configurable in app-settings
 * Fix error message concatenate in chunk files
 * Reporting progress by representation
 * Add duration for each representation

# 0.2.8
 * Fixed: some servers doesn't work correctly with default electron net class when "chunkedEncoding" has default value
 * Updating dependencies to latest 2018-05-09
 
# 0.2.7
 * Fixing manifest url to be the exact link passed by the user

# 0.2.6
 * Add support for fetching a new persistent license when one already exists
 
# 0.2.5
 * Updating dependencies to the latest 2018-04-30
 
# 0.2.4
 * Added fake Persistent Plugin for easier testing
 * Allowing to create persistent session before calling api "start"
 * Fix an exception if there is no manifest using removePersistent 
 
# 0.2.3
 * updated keywords and readme 
 
# 0.2.2
 * unhandled error exception for EventEmitter for Download
 
# 0.2.1
 * Added support for custom manifest id with error handling and ability to define own validation regex 
 * Minor fixes and improvements 
 
# 0.2.0
 * Use net module of electron to better manage proxy (replace request dependency)
 * Cleanup of unused functions
 * Support for Smooth Streaming
