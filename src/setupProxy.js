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

  app.use(
    '/anthropic',
    createProxyMiddleware({
      target: 'https://api.anthropic.com',
      changeOrigin: true,
      pathRewrite: {
        '^/anthropic': '',
      },
      onProxyRes: function(proxyRes) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );

  app.use(
    '/pollinations',
    createProxyMiddleware({
      target: 'https://image.pollinations.ai',
      changeOrigin: true,
      pathRewrite: {
        '^/pollinations': '',
      },
      onProxyRes: function(proxyRes) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
};
