import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  Image,
  Region,
  RegionOperationLog,
  UnauthenticatedError,
  UnauthorizedError,
  RegionNotFoundError,
} from 'src/app/services/dataaccess/api';
import { RegionImageService } from 'src/app/services/module/region-management/region-image.service';
import { RegionManagementService } from 'src/app/services/module/region-management/region-management.service';

@Component({
  selector: 'app-region-information',
  templateUrl: './region-information.component.html',
  styleUrls: ['./region-information.component.scss'],
})
export class RegionInformationComponent {
  public visible = false;
  public image: Image | undefined;
  public regionImage = '';
  public region: Region | undefined;
  public operationLogList: RegionOperationLog[] = [];
  public deletable = false;

  @Output() public regionDeleted = new EventEmitter<Region>();

  constructor(
    private readonly regionManagementService: RegionManagementService,
    private readonly regionImageService: RegionImageService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router
  ) {}

  public async open(image: Image, region: Region, deletable: boolean): Promise<void> {
    try {
      this.operationLogList = await this.regionManagementService.getRegionOperationLogList(image.id, region.id);
    } catch (e) {
      this.handleError('Failed to get region operation log list', e);
      return;
    }

    this.image = image;
    this.region = region;
    this.deletable = deletable;
    this.regionImage = await this.regionImageService.generateRegionImage(image.originalImageURL, region.border);
    this.visible = true;
  }

  public onCancelClicked(): void {
    this.visible = false;
  }

  public async onDeleteRegionClicked(): Promise<void> {
    if (!this.image || !this.region) {
      return;
    }

    this.visible = false;

    try {
      await this.regionManagementService.deleteRegion(this.image.id, this.region.id);
    } catch (e) {
      this.handleError('Failed to delete region', e);
      return;
    }

    this.notificationService.success('Deleted region successfully', '');
    this.regionDeleted.emit(this.region);
  }

  private handleError(notificationTitle: string, e: any): void {
    if (e instanceof UnauthenticatedError) {
      this.notificationService.error(notificationTitle, 'User is not logged in');
      this.router.navigateByUrl('/login');
      return;
    }
    if (e instanceof UnauthorizedError) {
      this.notificationService.error(notificationTitle, 'User does not have the required permission');
      this.router.navigateByUrl('/welcome');
      return;
    }
    if (e instanceof RegionNotFoundError) {
      this.notificationService.error(notificationTitle, 'Region cannot be found');
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
