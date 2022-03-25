/// <reference lib="webworker" />

import { uploadImageBatch } from './images.helper';

addEventListener('message', (event: MessageEvent<any[]>) => {
  uploadImageBatch(event.data).subscribe((value) => {
    postMessage(value);
  });
});
