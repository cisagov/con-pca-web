import * as XLSX from 'xlsx';

export class XlsxToCsv {
  arrayBuffer: any;

  /**
   *
   * @param file
   */
  public convert(file: File) {
    return new Promise(resolve => {
      if (
        file.type ==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        this.convertXlsx(file).then(x => {
          resolve(x);
        });
      } else {
        this.convertCsv(file).then(x => {
          resolve(x);
        });
      }
    });
  }

  /**
   * Converts a spreadsheet to a CSV string
   * @param file
   */
  public convertXlsx(file: File): Promise<string> {
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    return new Promise(resolve => {
      fileReader.onload = e => {
        /* read workbook */
        const bstr: any = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        let csv = XLSX.utils.sheet_to_csv(ws);
        resolve(csv);
      };
    });
  }

  /**
   * Reads a CSV file and returns the contents as a string.
   * @param file
   */
  public async convertCsv(file: File): Promise<string> {
    let fileReader = new FileReader();
    fileReader.readAsText(file);

    return new Promise(resolve => {
      fileReader.onload = e => {
        let x = fileReader.result.toString();
        resolve(x);
      };
    });
  }
}
