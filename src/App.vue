<template>
  <div id="app">
    <button class="red"  @click="selectFile"> excel to be JSON </button>
    <button class="blue" @click="selectFolder"> JSON to be excel </button>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import xlsx from 'node-xlsx';
import util from '@/utils';
import { on } from 'events';

const resolve = (dir) => {
  return path.join(__dirname, dir);
}

export default {
  name: 'App',
  data() {
    return {
      excelCusTitle: '字段名称(开发自定义)',
      startIndex: 1,
      xlsxData: [], // 表格数据列表
      fieldName: '',
      index: 0,
    }
  },
  methods: {
    selectFile() {
      // 调用主进程打开文件选择框(选择xlsx)文件
      ipcRenderer.send('open-directory-dialog', 'openFile');
      // 接口主进程返回的结果
      ipcRenderer.on('select-file', this.getFilePath);
    },
    getFilePath(event, filePathsList) {
      // 获取文件路径
      const path = filePathsList[0];
      // 解析buffer
      const sheetsList = xlsx.parse(`${path}`);
      // 生成buffer
      this.createJson(sheetsList);
    },
    createJson(sheetsList) {
      // 遍历 sheetList [{name: '', data: []}]
      sheetsList.forEach((sheet, index) => {
        // 只遍历第一个
        if (index === 0) {
          const titleData = sheet['data'][0]; // 获取表格第一行(国家名称)
          let fileNameList = []; // 文件名称列表
          // 可以选择第几列开始获取标题
          for (let i = this.startIndex, len = titleData.length; i < len; i++) {
            fileNameList.push(titleData[i]);
          }
          // for (let j = 0, len = fileNameList.length; j < len; j ++) {
          //   let contentText = `export default {`
          //   for (let rowId = 1, len = sheet['data'].length; rowId < len; rowId++) {
          //     contentText += `'${sheet['data'][rowId][0]} => ${sheet['data'][rowId][2]}': '${sheet['data'][rowId][j + 3]}',
          //     `;
          //   }
          //   contentText += `}`;
          //   fs.writeFileSync(resolve(`./xlsx/${fileNameList[j]}.js`), contentText);
          // }
        }
      });
    },

    // 选择文件夹
    selectFolder() {
      // 选择文件夹
      ipcRenderer.send('open-directory-dialog', 'openDirectory');
      ipcRenderer.on('select-folder', this.getFolderPath);
    },

    // get folder path
    getFolderPath(event, folderPathList) {
      const floderPath = folderPathList[0];
      this.readdir(floderPath);
    },

    // 文件读取
    readdir(floderPath) {
      const _that = this;
      // 根据文件路径读取文件，返回文件列表
      fs.readdir(floderPath, (err, files) => {
        if (err) {
          // TODO: 错误提示代优化
          console.warn(err)
        } else {
          _that.xlsxData.push([_that.excelCusTitle]);
          // 遍历读取到的文件列表
          files.forEach((filename, fileIndex) => {
            _that.excelRowList = [];
            if (/.json/.test(filename)) {
              _that.xlsxData[0].push(filename.split('.')[0]);  // 创建表格titleconsole.log(filename);
              // 读取文件内容
              const json = fs.readFileSync(`${floderPath}/${filename}`, { encoding: 'utf8' });
              const jsonData = JSON.parse(json);
              Object.keys(jsonData).forEach((key, index) => {
                _that.cereteFieldAndValue({ jsonItem: jsonData[key], index, fileIndex, key });
              });
            }
          });
          _that.createXlsx();
        }
      });
    },
    cereteFieldAndValue({ jsonItem, key, index, fileIndex }) {
      this.index = this.index + index;
      const __index = this.index;
      if (util.dataTypeDetection(jsonItem) === 'object') {
        // if (fileIndex === 0) {
          this.fieldName = `${key}`;
          let __oldKay = this.fieldName;
          Object.keys(jsonItem).forEach((key, idx) => {
            const __key =  `${__oldKay}-${key}`;
            this.cereteFieldAndValue({ jsonItem: jsonItem[key], fileIndex, index: __index + idx, key: __key });
          });
        // }
      }
      if (util.dataTypeDetection(jsonItem) === 'array') {
        this.fieldName = `${key}`;
        // if (fileIndex === 0) {
           if (util.dataTypeDetection(this.xlsxData[__index + 1]) === 'array') {
          this.xlsxData[__index + 1][0] = this.fieldName;
          } else {
            this.xlsxData[__index + 1] = [this.fieldName];
          }
        // }
        this.xlsxData[__index + 1].push(jsonItem.join('||'));
        this.fieldName = '';
      }
      if (util.dataTypeDetection(jsonItem) === 'string') {
        this.fieldName = `${key}`;
        // if (fileIndex === 0) {
          if (util.dataTypeDetection(this.xlsxData[__index + 1]) === 'array') {
            this.xlsxData[__index + 1][0] = this.fieldName;
          } else {
            this.xlsxData[__index + 1] = [this.fieldName];
          }
        // }
        this.xlsxData[__index + 1].push(jsonItem);
        this.fieldName = '';
      }
    },

    // 生成xlsx
    createXlsx() {
      console.log(this.xlsxData);
      // const buffer = xlsx.build([{ name: "i18n", data: this.xlsxData }]); // Returns a buffer
      // fs.writeFileSync(resolve('./i18n-electest.xlsx'), buffer);
    }
  },
}
</script>
<style lang="scss" scoped>
  #app {
    width: 100%;
    height: 100%;
    background: rgba(133,194,226, 0.2);
    -webkit-app-region: drag;
    .red {
      background-color: lightcoral;
      border-radius: 4px;
      overflow: hidden;
      -webkit-app-region: no-drag;
    }
    .blue {
      background-color: #417FF9;
      border-radius: 4px;
      overflow: hidden;
      -webkit-app-region: no-drag;
    }
  }
</style>