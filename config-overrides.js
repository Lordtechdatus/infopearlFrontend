module.exports = function override(config, env) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "url": require.resolve("url/"),
    "crypto": false,
    "http": false,
    "https": false,
    "stream": false,
    "util": false,
    "zlib": false,
    "buffer": false,
    "assert": false,
    "fs": false,
    "net": false,
    "tls": false,
    "path": false,
    "process": false,
    "querystring": false,
    "os": false,
  };

  return config;
}; 