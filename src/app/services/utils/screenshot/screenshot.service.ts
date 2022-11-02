import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class ScreenshotService {
  public async getScreenshot(): Promise<Blob> {
    return new Promise<Blob>(async (resolve, reject) => {
      const canvas = await html2canvas(document.body, {
        x: window.scrollX,
        y: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
      });
      return canvas.toBlob((blob) => {
        if (blob === null) {
          reject(new Error('null blob'));
        } else {
          resolve(blob);
        }
      });
    });
  }
}
