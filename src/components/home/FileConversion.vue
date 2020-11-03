<template>
  <div class="__flex conversion-wrap">
    <ModalMark ref="modalmark" @click="changeFolderName"></ModalMark>
    <p class="__flex __rcfs btn-wrapper">
      <CreateExcelTem class="btn create-default-excel"/>
      <ExcelToBeJson ref="excelToBeJsonRef" class="btn btn-excel-select" :modalmarkRef="modalmarkRef" />
      <JsonToBeExcel ref="jsonToBeExcelRef" class="btn" :modalmarkRef="modalmarkRef"/>
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
import Dashedline from '../common/Dashedline.vue';
import ModalMark from '../common/ModalMark.vue';
import CreateExcelTem from './CreateExcelTemplate';
import ExcelToBeJson from './ExcelToBeJson';
import JsonToBeExcel from './JsonToBeExcel';

const TO_JSON = 'TO_JSON';
const TO_EXCEL = 'TO_EXCEL';

export default {
  name: 'file-conversion-com',

  components: { Dashedline, ModalMark, CreateExcelTem, ExcelToBeJson, JsonToBeExcel },

  data() {
    return {
      modalmarkRef: '',
    }
  },
  
  mounted() {
    this.modalmarkRef = this.$refs.modalmark;
  },

  methods: {
    changeFolderName({ fileName, type }) {
      if (type === TO_JSON) {
        const __ref = this.$refs.excelToBeJsonRef;
        __ref.changeDefaultFileName(fileName); // mixins
        __ref.xlsxDataSplit();
      } else if (type === TO_EXCEL){
        const __ref = this.$refs.jsonToBeExcelRef;
        __ref.changeDefaultFileName(fileName); // mixins
        __ref.readdir();
      }
    },

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