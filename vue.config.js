const path = require('path');

function resolve (dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  configureWebpack: {
    target: 'electron-renderer',
  },
  publicPath: process.env.NODE_ENV === "development" ? "" : "./", // 本地调试，默认为空
  devServer: {
    port: 10044,
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('src', resolve('src'))
      .set('components', resolve('src/components'));
  },
  // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          target: ['nsis', 'zip'],
        },
        // https://www.electron.build/configuration/nsis
        nsis: {
          artifactName: '${productName}-${version}.${ext}',
        },
        productName: 'i18n_manage'
      }
    }
  }
}