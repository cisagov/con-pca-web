declare global {
  interface String {
    csvToArray(): Array<String>;
  }
}
String.prototype.csvToArray = function(): Array<String> {
  let retVal = Array<String>();
  String(this)
    .split(',')
    .forEach(item => {
      retVal.push(item.trim());
    });
  return retVal;
};
export {};
