export interface ListFileParser {
  parseFile(file: File): Promise<any[]>;
}
