const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/hf-api',
    createProxyMiddleware({
      target: 'https://api-inference.huggingface.co',
      changeOrigin: true,
      pathRewrite: {
        '^/hf-api': '',
      },
      onProxyRes: function(proxyRes) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
};
