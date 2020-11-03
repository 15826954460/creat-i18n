<template>
  <div class="__flex conversion-wrap">
    <ModalMark ref="modalmark" @click="changeFolderName"></ModalMark>
    <p class="__flex __rcfs btn-wrapper">
      <CreateExcelTem class="btn create-default-excel"/>
      <ExcelToBeJson ref="excelToBeJson" class="btn btn-excel-select" :modalmarkRef="modalmarkRef" />
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
import mixinsConver from '@/mixins/file-conversion.js';
import Btn from '../common/Button.vue';
import Dashedline from '../common/Dashedline.vue';
import ModalMark from '../common/ModalMark.vue';
import CreateExcelTem from './CreateExcelTemplate';
import ExcelToBeJson from './ExcelToBeJson';

const homedir = os.homedir();
const DEFAULT_PATH = `${homedir}\\Desktop\\`;
const CUSTOM_TITLE = '字段名称(开发自定义)';
const TO_JSON = 'TO_JSON';
const TO_EXCEL = 'TO_EXCEL';

export default {
  name: 'file-conversion-com',

  components: { Btn, Dashedline, ModalMark, CreateExcelTem, ExcelToBeJson },

  mixins: [mixinsConver],

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
    ipcRenderer.on('select-folder', this.getFolderPath);
  },

  methods: {
    changeFolderName({ fileName, type }) {
      // this.defaultJsonFolderName = fileName;
      if (type === TO_JSON) {
        const __ref = this.$refs.excelToBeJson;
        __ref.changeDefaultFileName(fileName);
        __ref.xlsxDataSplit();
      } else if (type === TO_EXCEL){
        this.selectFilePath && this.readdir(this.selectFilePath);
      }
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
      padding: 20px 40px;
    }

    .create-default-excel, .btn-excel-select {
      margin-right: 40px;
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