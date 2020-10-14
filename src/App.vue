<template>
  <div id="app">
    <button class="red"  @click="selectFile"> excel to be JSON </button>
    <button class="blue"  @click="selectFloder">JSON  to be excel </button>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import xlsx from 'node-xlsx';
import util from '@/utils';

const DEFAULT_PATH = 'C:\\Users\\baiyunsong\\Desktop\\';

export default {
  name: 'App',
  data() {
    return {
      excelCusTitle: '字段名称(开发自定义)',
      startIndex: 1,
      xlsxData: [], // 表格数据列表
      fieldName: '',
      index: 0,
      fload: false,
      celList: [],
      fileNameList: [],
      fieldNamesList: [],
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
      const path = filePathsList[0]; // 获取文件路径
      this.createJson(path);
    },
    createJson(path) {
      // 解析buffer
      const sheetsList = xlsx.parse(`${path}`);
      // 遍历 sheetList [{name: '', data: []}]
      sheetsList.forEach((sheet, index) => {
        // 只遍历第一个
        if (index === 0) {
          const sheetDataList = sheet['data'];
          const titleData = sheetDataList[0]; // 获取表格第一行(国家名称)
          this.excelDataRestruct(titleData, sheetDataList);
          this.createObjDataStruct();
        }
      });
    },

    // 表格数据进行重组 获取对应的列
    excelDataRestruct(titleData, sheetDataList) {
      const { fileNameList, celList, fieldNamesList } = this;
      // 生成文件名列表
      titleData.forEach((item, idx) => {
        (idx !== 0) && fileNameList.push(item); 
      });
      // 数据拆分提取
      sheetDataList.slice(1).forEach((rowArr, indx) => {
        rowArr.forEach((rowItem, rowItemIndex) => {
          // 提取列数据(每一列数据为一个json文件)
          if (rowItemIndex !== 0 ) {
            if (util.dataTypeDetection(celList[rowItemIndex - 1]) !== 'array') {
              celList[rowItemIndex - 1] = [];
              if (rowItemIndex !== 0) {
                celList[rowItemIndex - 1].push(rowItem);
              }
              return;
            }
            celList[rowItemIndex - 1].push(rowItem);
          }
          // 获取自定义字段名
          if (rowItemIndex === 0) {
            fieldNamesList.push(rowItem);
          }
        })
      });
    },

    createObjDataStruct() {
      const { celList, fieldNamesList, fileNameList } = this;
      const jsonData = {};
      for (let i = 0, len = celList.length; i < len; i++) {
        const celItemArr = celList[i];
        for (let j = 0, len = celItemArr.length; j < len; j++) {
          let arr = fieldNamesList[j].split('-');
          let __parentheses = '';
          if (arr.length > 1) {
            this.createObjTree(jsonData, arr, celItemArr, j);
          } else {
            if (util.dataTypeDetection(celItemArr[j]) === 'array') {
              jsonData[arr[0]] = celItemArr[j].split('||');
            } else {
              jsonData[arr[0]] = celItemArr[j];
            }
          }
        }
        this.createJsonData(jsonData, fileNameList[i]);
      }
    },

    // 生成对应的对象格式
    createObjTree(jsonData, arr, celItemArr, j) {
      let __fieldJson = {};
      arr.forEach((fieldValue, index) => {
        if (index === (arr.length - 1)) {
          this.createItemTree(__fieldJson, fieldValue, celItemArr[j]);
        } else {
          this.createItemTree(__fieldJson, fieldValue);
        }
      });
      this.deepMerge(jsonData, __fieldJson);
    },

    createJsonData(objData, jsonFileName) {
      const dir = `${DEFAULT_PATH}i18n_json`;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      fs.writeFileSync(`${dir}\\${jsonFileName}.json`, JSON.stringify(objData));
    },

    // 根据开发自定义字段生成数据结构
    createItemTree(obj, key, value) {
      if (!Object.keys(obj).length) {
        if (!value) {
          obj[key] = {}
        } else {
          obj[key] = value;
        }
      } else {
        Object.keys(obj).forEach(item => {
          this.createItemTree(obj[item], key, value)
        });
      }
    },

    // 深合并
    deepMerge(obj1, obj2) {
      let key;
      for (key in obj2) {
        // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
        // 如果obj2[key]没有值或者值不是对象，此时直接替换obj1[key]
        obj1[key] = obj1[key] &&
        obj1[key].toString() === "[object Object]" && (obj2[key] && obj2[key].toString() === "[object Object]")
          ? this.deepMerge(obj1[key], obj2[key]) : (obj1[key] = obj2[key]);
      }
      return obj1;
    },

    // 选择文件
    selectFloder() {
      ipcRenderer.send('open-directory-dialog', 'openDirectory');
      ipcRenderer.on('select-folder', this.getFolderPath);
    },

    // 获取文件路径
    getFolderPath(event, floderPathsList) {
      const path = floderPathsList[0]; // 获取文件路径
      this.readdir(path);
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
            this.index = this.index === 0 ? 0 : 1;
            if (/.json/.test(filename)) {
              _that.xlsxData[0].push(filename.split('.')[0]);  // 创建表格title
              // 读取文件内容
              const json = fs.readFileSync(`${floderPath}/${filename}`, { encoding: 'utf8' });
              const jsonData = JSON.parse(json);
              Object.keys(jsonData).forEach((key, index) => {
                this.index = this.index + (index > 0 ? 1 : 0);
                _that.fillXlsxData({ jsonItem: jsonData[key], index: this.index, fileIndex, key });
              });
            }
          });
          _that.createXlsx();
        }
      });
    },

    // 生成对应的 excel
    fillXlsxData({ jsonItem, key, index, fileIndex }) {
      if (util.dataTypeDetection(jsonItem) === 'object') {
        this.fieldName = `${key}`;
        let __oldKay = this.fieldName;
        Object.keys(jsonItem).forEach((key, idx) => {
          this.index = (index + idx) < this.index ? this.index + 1 : index + idx;
          const __key =  `${__oldKay}-${key}`;
          this.fillXlsxData({ jsonItem: jsonItem[key], fileIndex, index: this.index, key: __key });
        });
      }
      if (util.dataTypeDetection(jsonItem) === 'array') {
        this.fieldName = `${key}`;
        index = this.createFieldNames(fileIndex, index);
        this.xlsxData[index].push(jsonItem.join('||'));
        this.fieldName = '';
      }
      if (util.dataTypeDetection(jsonItem) === 'string') {
        this.fieldName = `${key}`;
        index = this.createFieldNames(fileIndex, index);
        this.xlsxData[index].push(jsonItem);
        this.fieldName = '';
      }
    },

    // 生成对应的 表格数据 列
    createFieldNames(fileIndex, index) {
      if (fileIndex === 0) {
        if (!this.xlsxData[index + 1]) {
          // 无添加的字段
          this.xlsxData[index + 1] = [this.fieldName];
          index = index + 1;
        } else {
          // 已存在添加字段,新生成一个列表
          this.xlsxData[index + 2] = [this.fieldName];
          this.index = index + 1;
          index = index + 2;
        }
      }
      return index;
    },

    // 生成xlsx
    createXlsx() {
      // TODO: 文件名称可选择(默认)
      const buffer = xlsx.build([{ name: "i18n", data: this.xlsxData }]); // Returns a buffer
      fs.writeFileSync(`${DEFAULT_PATH}i18n.xlsx`, buffer);
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