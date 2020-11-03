<template>
  <Btn text="Excel to be Json" class="select-excel-btn" @click="selectXlsx"></Btn>
</template>

<script>
import { ipcRenderer } from 'electron';
import fs from 'fs';
import os from 'os';
import path from 'path';
import xlsx from 'node-xlsx';
import mixinsConver from '@/mixins/file-conversion.js';
import util from '@/utils';
import Btn from '../common/Button.vue';

const homedir = os.homedir();
const DEFAULT_PATH = `${homedir}\\Desktop\\`;
const TO_JSON = 'TO_JSON';

export default {
  name: 'excel-to-be-json',

  mixins: [mixinsConver],

  props: {
    modalmarkRef: {
      required: true
    }
  },

  components: { Btn },

  data() {
    return {
      isConversioning: false,
      defaultJsonFolderName: 'i18nJson',
      selectFilePath: '',
      celList: [],
      fileNameList: [],
      fieldNamesList: [],
    }
  },

  mounted() {
    ipcRenderer.on('select-file', this.getFilePath);
  },

  methods: {
    /**
     * @description 选择数据表
     */
    selectXlsx() {
      if (this.isConversioning) {
        this.$toast.show({ mag: '当前有文件正在转换,请稍后再试' });
        return;
      }
      // 主进程打开文件选择
      ipcRenderer.send('open-directory-dialog', 'openFile');
    },

    /**
     * @description 获取当前文件路径
     */
    getFilePath(event, filePathsList) {
      const path = filePathsList[0]; // 获取文件路径
      this.selectFilePath = path;
      this.xlsxDataSplit(path);
    },

    /**
     * @description xlsx 数据拆分
     */
    xlsxDataSplit() {
      const dir = `${DEFAULT_PATH}${this.defaultJsonFolderName}`;
      // 生成 json 之前判断当前文件夹是否已存在
      if (fs.existsSync(dir)) {
        if (!this.modalmarkRef.isShowModalMark) {
          this.modalmarkRef.handleModalMark(true, TO_JSON);
          let __timer = setTimeout(() => {
            this.modalmarkRef.$refs.inputRename.focus();
            clearTimeout(__timer);
            __timer = null;
          }, 1000)
        } else {
          this.$toast.show({ msg: '当前文件已存在,请重新输入' });
          this.modalmarkRef.$refs.inputRename.focus();
        }
        return;
      }
      this.modalmarkRef.handleModalMark(false);
      this.conversionStatusChange(true); // mixins
      this.needShowLoading(); // mixins

      const sheetsList = xlsx.parse(`${this.selectFilePath}`); // xlsx buffer 解析
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
      this.conversionStatusChange(false); // mixins
      this.$loading.hidden();
      this.$toast.show({ msg: '转换完成,感谢使用', success: true });
    },

    /**
     * @description 生成对应的对象格式
     */
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

    /**
     * @description 深合并
     */
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

    /**
     * @description 根据开发自定义字段生成数据结构
     */
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
      // 桌面生成 i18n_json 文件夹
      const dir = `${DEFAULT_PATH}${this.defaultJsonFolderName}`;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      fs.writeFileSync(`${dir}\\${jsonFileName}.json`, JSON.stringify(objData));
      this.resetSomeData();
    },

    resetSomeData() {
      this.celList = [];
      this.fileNameList = [];
      this.fieldNamesList = [];
    },

  }
}
</script>

<style scoped lang="scss">
.select-excel-btn {
  background-color: var(--home-page-btn-excel-to-json-bg-color);

  &:hover {
    background-color: var(--home-page-btn-excel-to-json-bg-color-hover);
  }
}
</style>
