import { Injectable } from '@angular/core';
import { ListFileFormat, ListFileParserInput, parseListFile } from './list-file.helper';

@Injectable({
  providedIn: 'root',
})
export class ListFileService {
  public async parseListFile(file: File): Promise<any[]> {
    const format = file.name.endsWith('.xlsx') ? ListFileFormat.XLSX : ListFileFormat.CSV;
    const input = new ListFileParserInput(file, format);
    if (typeof Worker !== 'undefined') {
      return new Promise<any[]>((resolve) => {
        const worker = new Worker(new URL('./list-file.worker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = (event: MessageEvent<any[]>) => {
          resolve(event.data);
        };
        worker.postMessage(input);
      });
    }

    return parseListFile(input);
  }
}
