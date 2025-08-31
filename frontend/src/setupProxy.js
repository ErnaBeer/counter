const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Add CORS headers for FHEVM threads support
  app.use((req, res, next) => {
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
};