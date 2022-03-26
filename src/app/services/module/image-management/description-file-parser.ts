export class FilenameWithDescription {
  constructor(public filename: string, public description: string) {}
}

export interface DescriptionFileParser {
  parseFile(file: File): Promise<FilenameWithDescription[]>;
}
