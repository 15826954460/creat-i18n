export default {
  // 数据类型检测
  dataTypeDetection(data) {
    const dataObj = {}.toString.call(data);
    const type = dataObj.slice(8, dataObj.length - 1).toLowerCase();
    return type;
  }
}