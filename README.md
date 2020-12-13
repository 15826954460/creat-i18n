# i18n manage

## Project setup
```
yarn install
yarn elec:dev
yarn elec:build
```

#### 别名使用说明：
◉ 在js代码中可直接使用别名，例如：
@/common/js/xxx.js 等价于 src/common/js/xxx.js
common/js/xxx.js 等价于 src/common/js/xxx.js
◉ 在css或者html中使用别名，需要在别名前加“~”，例如：
@import "~common/stylus/font.styl";


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### electron learn document
See [electron](https://juejin.im/post/6844903878429769742)

### 规则说明

### 打包遇到的相关问题
报错： zip: not a valid zip file
解决办法：
  win电脑
    下载zip压缩包：https://github.com/electron/electron/releases/download/v9.3.1/electron-v9.3.1-win32-x64.zip 
    将压缩包放入 C:\Users\xxxx\AppData\Local\electron\Cache 文件下


警告：
1、description is missed in the package.json  
2、author is missed in the package.json

解决： 在json文件中添加对应的字段描述

### custom application icon
1、项目根目录下新建build文件，放入logo icon [相关规则限制参考](https://www.electron.build/configuration/nsis)

### 已完成
- [x] 多个 JSON 文件转 EXCEL
- [x] EXCEL 文件转 JSON
- [x] 转换过程中禁止继续选择文件转换限制
- [x] 针对已有的文件添加提示
- [ ] 支持开发自定义字段
- [ ] 支持修改文案
- [ ] 支持新增字段
- [ ] 根据i8n规范支持 动态文案
- [ ] 添加about按钮关联github相关信息

### 后续优化
- [ ] JSON 示意图优化
- [ ] 编写说明文档
- [ ] github 补充完善