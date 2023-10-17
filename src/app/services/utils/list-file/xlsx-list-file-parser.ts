import { ListFileParser } from './list-file-parser';
import { read, utils } from 'xlsx';

export class XlsxListFileParser implements ListFileParser {
  public async parseFile(file: File): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target === null) {
          return reject(new Error('Unexpected error'));
        }

        const content = e.target.result;
        const workbook = read(content, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = utils.sheet_to_json(sheet) as any[];

        const listResult = [];
        for (const row of rows) {
          listResult.push(row);
        }

        resolve(listResult);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsBinaryString(file);
    });
  }
}
