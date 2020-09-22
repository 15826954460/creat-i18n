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

const resolve = (dir) => {
  return path.join(__dirname, dir);
}

export default {
  name: 'App',
  data() {
    return {
      excelTitle: [
        '字段名称(开发自定义)',
        'ar',   'bgBG', 'bs',   'ca',   'csCZ',
        'daDK', 'de',   'elGR', 'enUS', 'es',
        'esES', 'etEE', 'faIR', 'fiFI', 'fr',
        'hiIN', 'hrHR', 'huHU', 'inID', 'it',
        'iw',   'jaJP', 'ko',   'ltLT', 'lvLV',
        'mk',   'msMY', 'myMM', 'nbNO', 'nl',
        'plPL', 'ptBR', 'ptPT', 'roRO', 'ruRU',
        'skSK', 'slSI', 'sr',   'svSE', 'thTH',
        'trTR', 'ukUA', 'viVN', 'zhCN', 'zhHK',
        'zhTW'
      ],
      startIndex: 1,
    }
  },
  mounted() { 
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
      // 根据文件路径读取文件，返回文件列表
      fs.readdir(floderPath, function(err,files){
        if (err) {
          // TODO: 错误提示代优化
          console.warn(err)
        } else {
          let filenameList = [];
          let xlxsData = [];
          // 遍历读取到的文件列表
          files.forEach((filename) => {
            if (/.json/.test(filename)) {
              filenameList.push(filename.split('.')[0]);
              // 读取文件内容
              const json = fs.readFileSync(filename, { encoding: 'utf8' });
              const jsonData = JSON.parse(json);
              xlxsData.push(jsonData);
            }
          });
          this.createXlsx();
        }
      });
    },

    // 生成xlsx
    createXlsx() {
      // TODO:
    }
  },
}
</script>
<style lang="scss" scoped>
  #app {
    width: 100%;
    height: 100%;
    background: rgba(133,194,226, 0.2);
    .red {
      background-color: lightcoral;
      border-radius: 4px;
      overflow: hidden;
    }
    .blue {
      background-color: #417FF9;
      border-radius: 4px;
      overflow: hidden;
    }
  }
</style>