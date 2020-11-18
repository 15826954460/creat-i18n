<template>
  <Btn text="Json to be Excel" class="select-json-floder-btn" @click="selectJsonFloder"></Btn>
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
const TO_EXCEL = 'TO_EXCEL';
const CUSTOM_TITLE = '字段名称(开发自定义)';

export default {
  name: 'json-to-be-excel',

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
      defaultJsonFolderName: 'i18nExcel',
      selectFilePath: '',
      index: 0,
      xlsxData: [],
    }
  },

  mounted() {
    ipcRenderer.on('select-folder', this.getFolderPath);
  },

  methods: {
    /**
     * @description 选择文件夹
     */
    selectJsonFloder() {
      if (this.isConversioning) {
        this.$toast.show({ mag: '当前有文件正在转换,请稍后再试' });
        return;
      }
      ipcRenderer.send('open-directory-dialog', 'openDirectory');
    },

    /**
     * @description 获取文件夹路径
     */
    getFolderPath(event, floderPathsList) {
      const path = floderPathsList[0]; // 获取文件路径
      this.selectFilePath = path;
      this.readdir();
    },

    /**
     * @description 文件读取
     */
    readdir() {
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
      this.conversionStatusChange(true); // mixins
      this.needShowLoading(); // mixins
      const _that = this;
      // 根据文件路径读取文件，返回文件列表
      fs.readdir(this.selectFilePath, (err, files) => {
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
              const json = fs.readFileSync(`${_that.selectFilePath}/${filename}`, { encoding: 'utf8' });
              const jsonData = JSON.parse(json);
              Object.keys(jsonData).forEach((key, index) => {
                // this.index = this.index + (index > 0 ? 1 : 0);
                _that.fillXlsxData({ jsonItem: jsonData[key], index: this.index, fileIndex, key });
              });
            }
          });
          _that.createXlsx();
        }
      });
    },

    /**
     * @description 生成对应的 excel
     */
    fillXlsxData({ jsonItem, key, index, fileIndex, addOne }) {
      if (util.dataTypeDetection(jsonItem) === 'object') {
        this.fieldName = `${key}`;
        let __oldKay = this.fieldName;
        const keys = Object.keys(jsonItem);
        keys.forEach((key, idx) => {
          const __key =  `${__oldKay}-${key}`;
          // this.index = (index + idx) < this.index ? this.index + 1 : index + idx;
          this.index = (index + idx) < this.index ? this.index : index + idx;
          if (idx === keys.length - 1) {
            this.fillXlsxData({
              jsonItem: jsonItem[key],
              index: this.index,
              fileIndex,
              key: __key,
              addOne: true,
            });
          } else {
            this.fillXlsxData({
              jsonItem: jsonItem[key],
              index: this.index,
              fileIndex,
              key: __key,
            });
          }
        });
      }
      if (util.dataTypeDetection(jsonItem) === 'array') {
        this.fieldName = `${key}`;
        index = this.createFieldNames(fileIndex, index);
        this.xlsxData[index].push(jsonItem.join('||'));
        this.fieldName = '';
        if (addOne) {
          this.index += 1;
        }
      }
      if (util.dataTypeDetection(jsonItem) === 'string') {
        this.fieldName = `${key}`;
        index = this.createFieldNames(fileIndex, index);
        this.xlsxData[index].push(jsonItem);
        this.fieldName = '';
        if (addOne) {
          this.index += 1;
        }
      }
    },

    /**
     * @description 生成对应的 表格数据 列
     */
    createFieldNames(fileIndex, index) {
      if (fileIndex === 0) {
        if (!this.xlsxData[index + 1]) {
          // 无添加的字段
          this.xlsxData[index + 1] = [this.fieldName];
          index = index + 1;
        } else {
          // 已存在添加字段,新生成一个列表
          this.xlsxData[index + 2] = [this.fieldName];
          index = index + 2;
        }
      }
      return index;
    },

    /**
     * @description 生成xlsx
     */
    createXlsx() {
      const dir = `${DEFAULT_PATH}${this.defaultJsonFolderName}.xlsx`;
      const buffer = xlsx.build([{ name: "i18n", data: this.xlsxData }]); // Returns a buffer
      fs.writeFileSync(dir, buffer);
      this.resetSomeData();
      this.conversionStatusChange(false); // mixins
      this.$loading.hidden();
      this.$toast.show({ msg: '转换完成,感谢使用！', success: true });
    },

    /**
     * @description 重置数据
     */
    resetSomeData() {
      this.xlsxData = [];
      this.index = 0;
      this.isConversioning = false;
      this.changeDefaultFileName();
    },

  },
}
</script>

<style lang="scss">
.select-json-floder-btn { 
  background-color: var(--home-page-btn-json-to-excel-bg-color);

  &:hover {
    background-color: var(--home-page-btn-json-to-excel-bg-color-hover);
  }
}
</style>