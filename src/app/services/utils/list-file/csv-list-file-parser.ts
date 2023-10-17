import { parse } from 'papaparse';
import { ListFileParser } from './list-file-parser';

export class CsvListFileParser implements ListFileParser {
  public async parseFile(file: File): Promise<any[]> {
    return new Promise<any[]>((resolve) => {
      const listResult: any[] = [];
      parse(file, {
        header: true,
        step: (results) => {
          if (results.errors.length > 0) {
            return;
          }
          const row = results.data as any;
          listResult.push(row);
        },
        complete: () => {
          resolve(listResult);
        },
      });
    });
  }
}
