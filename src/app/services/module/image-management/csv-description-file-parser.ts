import { parse } from 'papaparse';
import {
  DescriptionFileParser,
  FilenameWithDescription,
} from './description-file-parser';

export class CsvDescriptionFileParser implements DescriptionFileParser {
  public async parseFile(file: File): Promise<FilenameWithDescription[]> {
    return new Promise<FilenameWithDescription[]>((resolve) => {
      const filenameWithDescriptionList: FilenameWithDescription[] = [];
      parse(file, {
        header: true,
        step: (results) => {
          if (results.errors.length > 0) {
            return;
          }
          const row = results.data as any;
          if (row.Filename === undefined || row.Description === undefined) {
            return;
          }
          filenameWithDescriptionList.push({
            filename: row.Filename,
            description: row.Description,
          });
        },
        complete: () => {
          resolve(filenameWithDescriptionList);
        },
      });
    });
  }
}
