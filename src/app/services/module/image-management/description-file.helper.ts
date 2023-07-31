import { CsvDescriptionFileParser } from './csv-description-file-parser';
import { DescriptionFileParser, FilenameWithDescription } from './description-file-parser';
import { XlsxDescriptionFileParser } from './xlsx-description-file-parser';

export enum DescriptionFileFormat {
  CSV,
  XLSX,
}

export class DescriptionFileParserInput {
  constructor(public readonly file: File, public readonly format: DescriptionFileFormat) {}
}

export async function parseDescriptionFile(input: DescriptionFileParserInput): Promise<FilenameWithDescription[]> {
  const { file, format } = input;
  let parser: DescriptionFileParser;
  switch (format) {
    case DescriptionFileFormat.CSV:
      parser = new CsvDescriptionFileParser();
      break;
    case DescriptionFileFormat.XLSX:
      parser = new XlsxDescriptionFileParser();
      break;
    default:
      throw new Error(`Unknown description file format: ${format}`);
  }
  return await parser.parseFile(file);
}
