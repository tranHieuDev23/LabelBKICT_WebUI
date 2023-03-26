import { Injectable } from '@angular/core';
import { Polygon, Region, RegionOperationLog, RegionsService } from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class RegionManagementService {
  constructor(private readonly regionsService: RegionsService) {}

  public async createRegion(
    imageID: number,
    border: Polygon,
    holes: Polygon[],
    regionLabelID: number
  ): Promise<Region> {
    return await this.regionsService.createRegion(imageID, border, holes, regionLabelID);
  }

  public async deleteRegionOfImage(imageID: number): Promise<void> {
    return await this.regionsService.deleteRegionOfImage(imageID);
  }

  public async deleteRegion(imageID: number, regionID: number): Promise<void> {
    return await this.regionsService.deleteRegion(imageID, regionID);
  }

  public async updateRegionBoundary(
    imageID: number,
    regionID: number,
    border: Polygon,
    holes: Polygon[]
  ): Promise<Region> {
    return await this.regionsService.updateRegionBoundary(imageID, regionID, border, holes);
  }

  public async updateRegionRegionLabel(imageID: number, regionID: number, regionLabelID: number): Promise<Region> {
    return await this.regionsService.updateRegionRegionLabel(imageID, regionID, regionLabelID);
  }

  public async getRegionOperationLogList(imageID: number, regionID: number): Promise<RegionOperationLog[]> {
    return await this.regionsService.getRegionOperationLogList(imageID, regionID);
  }
}
