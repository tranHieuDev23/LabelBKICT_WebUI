import {
  DescriptionFileParser,
  FilenameWithDescription,
} from './description-file-parser';
import { read, utils } from 'xlsx';

export class XlsxDescriptionFileParser implements DescriptionFileParser {
  public async parseFile(file: File): Promise<FilenameWithDescription[]> {
    return new Promise<FilenameWithDescription[]>((resolve, reject) => {
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

        const filenameWithDescriptionList = [];
        for (const row of rows) {
          if (row.Filename === undefined || row.Description === undefined) {
            continue;
          }
          filenameWithDescriptionList.push({
            filename: row.Filename,
            description: row.Description,
          });
        }

        resolve(filenameWithDescriptionList);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsBinaryString(file);
    });
  }
}
