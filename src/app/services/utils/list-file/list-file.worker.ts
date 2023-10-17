/// <reference lib="webworker" />

import { parseListFile, ListFileParserInput } from './list-file.helper';

addEventListener('message', (event: MessageEvent<ListFileParserInput>) => {
  parseListFile(event.data).then((value) => {
    postMessage(value);
  });
});
