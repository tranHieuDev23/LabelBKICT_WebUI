/// <reference lib="webworker" />

import {
  parseDescriptionFile,
  DescriptionFileParserInput,
} from './description-file.helper';

addEventListener(
  'message',
  (event: MessageEvent<DescriptionFileParserInput>) => {
    parseDescriptionFile(event.data).then((value) => {
      postMessage(value);
    });
  }
);
