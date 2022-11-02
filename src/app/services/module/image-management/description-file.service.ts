import { Injectable } from '@angular/core';
import { FilenameWithDescription } from './description-file-parser';
import {
  DescriptionFileFormat,
  DescriptionFileParserInput,
  parseDescriptionFile,
} from './description-file.helper';

@Injectable({
  providedIn: 'root',
})
export class DescriptionFileService {
  public async parseDescriptionFile(
    file: File
  ): Promise<FilenameWithDescription[]> {
    const format = file.name.endsWith('.xlsx')
      ? DescriptionFileFormat.XLSX
      : DescriptionFileFormat.CSV;
    const input = new DescriptionFileParserInput(file, format);
    if (typeof Worker !== 'undefined') {
      return new Promise<FilenameWithDescription[]>((resolve) => {
        const worker = new Worker(
          new URL('./description-file.worker.ts', import.meta.url),
          { type: 'module' }
        );
        worker.onmessage = (event: MessageEvent<FilenameWithDescription[]>) => {
          resolve(event.data);
        };
        worker.postMessage(input);
      });
    }

    return parseDescriptionFile(input);
  }
}
