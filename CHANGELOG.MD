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
