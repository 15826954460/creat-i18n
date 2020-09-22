module.exports = {
  configureWebpack: {
    target: 'electron-renderer',
  },
  publicPath: process.env.NODE_ENV === "development" ? "" : "./", // 本地调试，默认为空
  devServer: {
    port: 10044,
  },
}