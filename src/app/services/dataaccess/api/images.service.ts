import { Injectable } from '@angular/core';
import { Axios } from 'axios';
import { Observable } from 'rxjs';
import {
  uploadImageBatch,
  UploadImageBatchMessage,
  UploadImageBatchMessageType,
  UploadImageInput,
} from './images.helper';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor(private readonly axios: Axios) {}

  public createImageBatch(
    inputList: UploadImageInput[]
  ): Observable<UploadImageBatchMessage> {
    return new Observable<UploadImageBatchMessage>((subscriber) => {
      if (typeof Worker !== 'undefined') {
        const worker = new Worker(
          new URL('./images.worker.ts', import.meta.url),
          { type: 'module' }
        );
        worker.onmessage = (event: MessageEvent<UploadImageBatchMessage>) => {
          subscriber.next(event.data);
          if (event.data.type === UploadImageBatchMessageType.UPLOAD_COMPLETE) {
            subscriber.complete();
          }
        };
        worker.postMessage(inputList);
      } else {
        uploadImageBatch(inputList).subscribe(subscriber);
      }
    });
  }
}
