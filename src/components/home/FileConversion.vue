<template>
  <div class="__flex conversion-wrap">
    <ModalMark ref="modalmark" @click="changeFolderName"></ModalMark>
    <p class="__flex __rcfs btn-wrapper">
      <Btn text="Create excel Template" class="btn btn-excel-select" @click="createDefaultExcelTemplate"></Btn>
      <Btn text="Excel to be Json" class="btn btn-excel-select" @click="selectXlsx"></Btn>
      <Btn text="Json to be Excel" class="btn btn-json-select" @click="selectJsonFloder"></Btn>
    </p>
    <Dashedline></Dashedline>
    <div class="__flex __rcfe diagram-wrap">
      <div class="diagram-excel diagram-item">
        <span class="title">Excel 表格示例</span>
        <p class="diagram-img"></p>
      </div>
      <p class="__flex __ccc conversion-icon-wrap">
        <i class="__inb conversion-icon"></i>
      </p>
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
import { mapState, mapMutations } from 'vuex';
import Btn from '../common/Button.vue';
import Dashedline from '../common/Dashedline.vue';
import ModalMark from '../common/ModalMark.vue';

const homedir = os.homedir();
const DEFAULT_PATH = `${homedir}\\Desktop\\`;
const CUSTOM_TITLE = '字段名称(开发自定义)';
const TO_JSON = 'TO_JSON';
const TO_EXCEL = 'TO_EXCEL';

export default {
  name: 'file-conversion-com',

  components: { Btn, Dashedline, ModalMark },

  computed: {
    ...mapState(['countriesList']),
  },

  data() {
    return {
      fieldName: '',
      index: 0,
      xlsxData: [], // 表格数据列表
      celList: [],
      fileNameList: [],
      fieldNamesList: [],
      defaultJsonFolderName: '',
      selectFilePath: '',
      modalmarkRef: '',
      isConversioning: false,
    }
  },
  
  mounted() {
    this.modalmarkRef = this.$refs.modalmark;
    // 接受主进程返回通信
    ipcRenderer.on('select-file', this.getFilePath);
    ipcRenderer.on('select-folder', this.getFolderPath);
  },

  methods: {
    createDefaultExcelTemplate() {
      if (this.isConversioning) {
        this.$toast.show({ mag: '当前有文件正在转换,请稍后再试' });
        return;
      }
      let __xlsxData = [];
      __xlsxData.push([CUSTOM_TITLE])
      this.conversionStatusChange(true);
      this.needShowLoading();
      this.countriesList.forEach(item => {
        __xlsxData[0].push(item.code);
      });
      const dir = `${DEFAULT_PATH}${this.defaultJsonFolderName}.xlsx`; // 待修改
      const buffer = xlsx.build([{ name: "i18n", data: __xlsxData }]);
      fs.writeFileSync(dir, buffer);
      this.conversionStatusChange(false);
      this.$toast.show({ msg: '转换完成,感谢使用！', success: true });
    },

    needShowLoading() {
      let __setp = 0;
      let __timer = setInterval(() => {
        if (!this.isConversioning) {
          clearInterval(__timer);
          __timer = null;
        } else if (__setp >= 2000 && this.isConversioning) {
          this.$loading.show();
          clearInterval(__timer);
          __timer = null;
        }
        __setp += 200;
      }, 200);
    },

    conversionStatusChange(bool) {
      this.isConversioning = bool;
    },

    changeFolderName({ fileName, type }) {
      this.defaultJsonFolderName = fileName;
      if (type === TO_JSON) {
        this.selectFilePath && this.xlsxDataSplit(this.selectFilePath);
      } else if (type === TO_EXCEL){
        this.selectFilePath && this.readdir(this.selectFilePath);
      }
    },

    /**
     * @description 选择数据表
     */
    selectXlsx() {
      if (this.isConversioning) {
        this.$toast.show({ mag: '当前有文件正在转换,请稍后再试' });
        return;
      }
      this.defaultJsonFolderName = 'i18nJson';
      // 主进程打开文件选择
      ipcRenderer.send('open-directory-dialog', 'openFile');
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
      const dir = `${DEFAULT_PATH}${this.defaultJsonFolderName}`;
      // 生成 json 之前判断当前文件夹是否已存在
      if (fs.existsSync(dir)) {
        if (!this.modalmarkRef.isShowModalMark) {
          this.modalmarkRef.handleModalMark(true, TO_JSON);
          this.selectFilePath = path;
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
      this.conversionStatusChange(true);
      this.needShowLoading();

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
      this.conversionStatusChange(false);
      this.$loading.hidden();
      this.$toast.show({ msg: '转换完成,感谢使用', success: true });
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
      // 桌面生成 i18n_json 文件夹
      const dir = `${DEFAULT_PATH}${this.defaultJsonFolderName}`;
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
      if (this.isConversioning) {
        this.$toast.show({ mag: '当前有文件正在转换,请稍后再试' });
        return;
      }
      this.defaultJsonFolderName = 'i18nExcel';
      ipcRenderer.send('open-directory-dialog', 'openDirectory');
    },

    /**
     * @description 获取文件夹路径
     */
    getFolderPath(event, floderPathsList) {
      const path = floderPathsList[0]; // 获取文件路径
      this.selectFilePath = path;
      this.readdir(path);
    },

    // 文件读取
    readdir(floderPath) {
      const dir = `${DEFAULT_PATH}${this.defaultJsonFolderName}.xlsx`;
      if (fs.existsSync(dir)) {
        if (!this.modalmarkRef.isShowModalMark) {
          this.modalmarkRef.handleModalMark(true, TO_EXCEL);
          let __timer = setTimeout(() => {
            this.modalmarkRef.$refs.inputRename.focus();
            clearTimeout(__timer);
            __timer = null;
          }, 1000);
        } else {
          this.$toast.show({ msg: '当前文件已存在,请重新输入' });
          this.modalmarkRef.$refs.inputRename.focus();
        }
        return;
      }
      this.modalmarkRef.handleModalMark(false);
      this.conversionStatusChange(true);
      this.needShowLoading();
      const _that = this;
      // 根据文件路径读取文件，返回文件列表
      fs.readdir(floderPath, (err, files) => {
        if (err) {
          this.$toast.show({ msg: '文件路径获取失败,请重新尝试' });
        } else {
          _that.xlsxData.push([CUSTOM_TITLE]);
          // 遍历读取到的文件列表
          files.forEach((filename, fileIndex) => {
            this.index = this.index === 0 ? 0 : 1;
            if (/.json/.test(filename)) {
              _that.xlsxData[0].push(filename.split('.')[0]);  // 创建表格title(国家码)
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
          this.fillXlsxData({ jsonItem: jsonItem[key], index: this.index, fileIndex, key: __key });
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

    resetSomeData() {
      this.celList = [];
      this.fileNameList = [];
      this.fieldNamesList = [];
      this.xlsxData = [];
      this.index = 0;
    },

    // 生成xlsx
    createXlsx() {
      const dir = `${DEFAULT_PATH}${this.defaultJsonFolderName}.xlsx`;
      const buffer = xlsx.build([{ name: "i18n", data: this.xlsxData }]); // Returns a buffer
      fs.writeFileSync(dir, buffer);
      this.resetSomeData();
      this.conversionStatusChange(false);
      this.$loading.hidden();
      this.$toast.show({ msg: '转换完成,感谢使用！', success: true });
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
      padding: 23px 40px;
    }
    .btn-excel-select {
      margin-right: 40px;
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

    .conversion-icon-wrap {
      width: 40px;
      height: 190px;
    }
    .conversion-icon {
      height: 20px;
      width: 40px;
      background: url('../../assets/images/common/conversion-icon.svg');
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }

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
        flex-shrink: 0;
      }
    }

    .diagram-excel {
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