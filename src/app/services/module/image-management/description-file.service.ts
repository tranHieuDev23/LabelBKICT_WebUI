import { Injectable } from '@angular/core';
import { ListFileService } from '../../utils/list-file/list-file.service';

export class FilenameWithDescription {
  constructor(public filename: string, public description: string) {}
}

@Injectable({
  providedIn: 'root',
})
export class DescriptionFileService {
  constructor(private readonly listFileService: ListFileService) {}

  public async parseDescriptionFile(file: File): Promise<FilenameWithDescription[]> {
    const rows = await this.listFileService.parseListFile(file);
    return rows.map((row) => new FilenameWithDescription(row.Filename, row.Description));
  }
}
