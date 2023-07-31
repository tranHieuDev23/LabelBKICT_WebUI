import { Injectable } from '@angular/core';
import { Export, ExportsService, ExportType, ImageListFilterOptions } from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class ExportManagementService {
  constructor(private readonly exportsService: ExportsService) {}

  public async createExport(type: ExportType, filterOptions: ImageListFilterOptions): Promise<Export> {
    return this.exportsService.createExport(type, filterOptions);
  }

  public async getExportList(
    offset: number,
    limit: number
  ): Promise<{ totalExportCount: number; exportList: Export[] }> {
    return this.exportsService.getExportList(offset, limit);
  }

  public async deleteExport(id: number): Promise<void> {
    await this.exportsService.deleteExport(id);
  }

  public async getExportFile(id: number): Promise<void> {
    await this.exportsService.getExportFile(id);
  }
}
