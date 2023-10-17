import { CsvListFileParser } from './csv-list-file-parser';
import { ListFileParser } from './list-file-parser';
import { XlsxListFileParser } from './xlsx-list-file-parser';

export enum ListFileFormat {
  CSV,
  XLSX,
}

export class ListFileParserInput {
  constructor(public readonly file: File, public readonly format: ListFileFormat) {}
}

export async function parseListFile(input: ListFileParserInput): Promise<any[]> {
  const { file, format } = input;
  let parser: ListFileParser;
  switch (format) {
    case ListFileFormat.CSV:
      parser = new CsvListFileParser();
      break;
    case ListFileFormat.XLSX:
      parser = new XlsxListFileParser();
      break;
    default:
      throw new Error(`Unknown List file format: ${format}`);
  }
  return await parser.parseFile(file);
}
