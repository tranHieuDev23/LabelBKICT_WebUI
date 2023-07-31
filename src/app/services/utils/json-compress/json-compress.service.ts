import { Injectable } from '@angular/core';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

@Injectable({
  providedIn: 'root',
})
export class JSONCompressService {
  constructor() {}

  public compress(obj: any): string {
    const jsonStr = JSON.stringify(obj);
    return compressToEncodedURIComponent(jsonStr);
  }

  public decompress(compressed: string): any {
    const decompressedString = decompressFromEncodedURIComponent(compressed);
    if (decompressedString === null) {
      return null;
    }
    return JSON.parse(decompressedString);
  }
}
