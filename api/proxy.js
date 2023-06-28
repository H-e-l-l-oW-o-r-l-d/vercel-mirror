const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const { parse } = require('node-html-parser');

const proxy = createProxyMiddleware({
  target: "https://dns.google/",
  changeOrigin: true,
  selfHandleResponse: true,
  pathRewrite: {
    // rewrite request path `/backend`
    //  /backend/user/login => http://google.com/user/login
    //   "^/backend/": "/",
  },
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (proxyRes.headers['content-type'].includes('text/html')) {
      const root = parse(responseBuffer);
      root.querySelector(".logo").remove();
      root.querySelector(".help").remove();
      root.querySelector('a[href="https://developers.google.com/speed/public-dns/docs/using"]').remove();
      root.querySelector('a[href="https://developers.google.com/speed/public-dns"]').remove();
      return root.toString('utf8');
    } else {
      console.log(proxyRes.headers['content-type'])
    }
    return responseBuffer;
  })
});

module.exports = (req, res) => {
  //   if (
  //     req.url.startsWith("/api") ||
  //     req.url.startsWith("/auth") ||
  //     req.url.startsWith("/banner") ||
  //     req.url.startsWith("/CollegeTask")
  //   ) {
  //     target = "http://106.15.2.32:6969";
  //   }
  proxy(req, res);
};
