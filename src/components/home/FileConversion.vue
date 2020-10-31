<template>
  <div class="__flex conversion-wrap">
    <p class="__flex __rcfs btn-wrapper">
      <Btn text="Excel to be Json" class="btn btn-excel-select" @click="selectXlsx"></Btn>
      <Btn text="Json to be Excel" class="btn btn-json-select" @click="selectJsonFloder"></Btn>
    </p>
    <Dashedline></Dashedline>
    <div class="__flex __rcfs diagram-wrap">
      <div class="diagram-excel diagram-item">
        <span class="title">Excel 表格示例</span>
        <p class="diagram-img"></p>
      </div>
      <div class="diagram-json diagram-item">
        <span class="title">Json 文件示例</span>
        <p class="diagram-img"></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import fs from 'fs';
import os from 'os';
import path from 'path';
import xlsx from 'node-xlsx';
import util from '@/utils';
import Btn from '../common/Button.vue';
import Dashedline from '../common/Dashedline.vue';

const homedir = os.homedir();
const DEFAULT_PATH = `${homedir}\\Desktop\\`;
const CUSTOM_TITLE = '字段名称(开发自定义)';

export default {
  name: 'file-conversion-com',

  components: { Btn, Dashedline },

  data() {
    return {
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
  
  mounted() {
  },

  methods: {
    /**
     * @description 选择数据表
     */
    selectXlsx() {
      // 主进程打开文件选择
      ipcRenderer.send('open-directory-dialog', 'openFile');
      // 接受主进程返回通信
      ipcRenderer.on('select-file', this.getFilePath);
    },

    /**
     * @description 获取当前文件路径
     */
    getFilePath(event, filePathsList) {
      const path = filePathsList[0]; // 获取文件路径
      this.xlsxDataSplit(path);
    },

    /**
     * @description xlsx 数据拆分
     */
    xlsxDataSplit(path) {
      const sheetsList = xlsx.parse(`${path}`); // xlsx buffer 解析
      // 遍历 sheetList [{ name: '', data: [] }, { name: '', data: [] }]
      const sheetDataList = sheetsList[0]['data'];
      const titleData = sheetDataList[0]; // 获取表格第一行(国家名称)
      this.excelDataRestruct(titleData, sheetDataList);
      this.createJsonDataStruct();
    },

    /**
     * @description 表格数据进行重组 获取对应的列
     */
    excelDataRestruct(titleData, sheetDataList) {
      const { fileNameList, celList, fieldNamesList } = this;
      // 生成JSON文件名列表
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
          // 生成自定义字段列表
          if (rowItemIndex === 0) {
            fieldNamesList.push(rowItem);
          }
        })
      });
    },

    /**
     * @description 生成单个文件的JSON数据
     */
    createJsonDataStruct() {
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
        this.createJsonFile(jsonData, fileNameList[i]);
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

    createJsonFile(objData, jsonFileName) {
      const dir = `${DEFAULT_PATH}i18n_json`;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      fs.writeFileSync(`${dir}\\${jsonFileName}.json`, JSON.stringify(objData));
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
    selectJsonFloder() {
      ipcRenderer.send('open-directory-dialog', 'openDirectory');
      ipcRenderer.on('select-folder', this.getFolderPath);
    },

    /**
     * @description 获取文件夹路径
     */
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
          _that.xlsxData.push([CUSTOM_TITLE]);
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
      const buffer = xlsx.build([{ name: "i18n", data: this.xlsxData }]); // Returns a buffer
      fs.writeFileSync(`${DEFAULT_PATH}i18n.xlsx`, buffer);
    }
  },
}
</script>

<style scoped lang="scss">
.conversion-wrap {
  width: 100%;
  flex-direction: column;

  .btn-wrapper {
    margin-bottom: 40px;

    .btn {
      font-size: 15px;
      font-weight: bold;
      padding: 23px 45px;
    }
    .btn-excel-select {
      margin-right: 72px;
      background-color: var(--home-page-btn-excel-to-json-bg-color);
      &:hover {
        background-color: var(--home-page-btn-excel-to-json-bg-color-hover);
      }
    }
    .btn-json-select { 
      background-color: var(--home-page-btn-json-to-excel-bg-color);
      &:hover {
        background-color: var(--home-page-btn-json-to-excel-bg-color-hover);
      }
    }
  }

  .diagram-wrap {
    width: 100%;
    margin: 48px auto 0;

    .diagram-item {
      .title {
        color: var(--diagram-title-color);
        font-size: 14px;
      }

      .diagram-img {
        height: 190px;
        width: 400px;
        border: 1px dashed var(--dashed-line-color);
        border-radius: 8px;
        overflow: hidden;
        margin-top: 16px;
        background-size: 100% 100%;
      }
    }

    .diagram-excel {
      margin-right: 40px;
      .diagram-img {
        background-image: url('../../assets/images/common/excel-diagram.png');
      }
    }

    .diagram-json {
      .diagram-img {
        background-image: url('../../assets/images/common/json-diagram.png');
      }
    }
  }
}
</style>
