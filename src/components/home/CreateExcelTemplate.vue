<template>
  <Btn text="Create default excel" class="btn" @click="createDefaultExcelTemplate"></Btn>
</template>

<script>
import fs from 'fs';
import os from 'os';
import xlsx from 'node-xlsx';
import mixinsConver from '@/mixins/file-conversion.js';
import { mapState } from 'vuex';
import Btn from '../common/Button.vue';

const homedir = os.homedir();

const CUSTOM_TITLE = '字段名称(开发自定义)';
const DEFAULT_PATH = `${homedir}\\Desktop\\`;

export default {
  name: 'create-excel-tem-com',

  mixins: [mixinsConver],

  components: { Btn },

  data() {
    return {
      isConversioning: false,
      defaultFileName: 'i18n_excel_template',
    }
  },

  computed: {
    ...mapState(['countriesList']),
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

      const dir = `${DEFAULT_PATH}${this.defaultFileName}.xlsx`; // 待修改
      const buffer = xlsx.build([{ name: "i18n", data: __xlsxData }]);
      fs.writeFileSync(dir, buffer);
      this.conversionStatusChange(false);
      this.$toast.show({ msg: '转换完成,感谢使用！', success: true });
    },
  }
}
</script>

<style scoped lang="scss">
.btn {
  font-size: 15px;
  font-weight: bold;
  padding: 20px 40px;
  background: var(--btn-create-default-tem-bg-color);

  &:hover {
    background: var(--btn-create-default-tem-hover-bg-color);
  }
}
</style>
