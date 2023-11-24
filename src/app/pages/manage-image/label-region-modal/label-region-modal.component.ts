import { Location } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Shape } from 'src/app/components/region-selector/models';
import {
  ImageNotFoundError,
  InvalidRegionInformation,
  Region,
  RegionLabel,
  RegionLabelCannotBeAssignedToImageError,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { RegionManagementService } from 'src/app/services/module/region-management/region-management.service';

@Component({
  selector: 'app-label-region-modal',
  templateUrl: './label-region-modal.component.html',
  styleUrls: ['./label-region-modal.component.scss'],
})
export class LabelRegionModalComponent {
  public visible = false;
  public regionLabelList: RegionLabel[] = [];
  public isAddingSelectedRegion = false;

  @Output() regionAdded = new EventEmitter<Region>();

  private imageID: number | undefined;
  private selectedBorder: Shape | undefined;
  private selectedHoleList: Shape[] = [];

  constructor(
    private readonly regionManagementService: RegionManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  public open(imageID: number, selectedBorder: Shape, selectedHoleList: Shape[], regionLabelList: RegionLabel[]): void {
    this.imageID = imageID;
    this.selectedBorder = selectedBorder;
    this.selectedHoleList = selectedHoleList;
    this.regionLabelList = regionLabelList;
    this.isAddingSelectedRegion = false;
    this.visible = true;
  }

  public close(): void {
    this.visible = false;
  }

  public async onRegionLabelClicked(regionLabel: RegionLabel): Promise<void> {
    if (this.isAddingSelectedRegion || this.imageID === undefined || this.selectedBorder === undefined) {
      return;
    }

    const border = { vertices: this.selectedBorder.getVertices() };
    const holes = this.selectedHoleList.map((hole) => {
      return { vertices: hole.getVertices() };
    });

    try {
      this.isAddingSelectedRegion = true;
      const region = await this.regionManagementService.createRegion(this.imageID, border, holes, regionLabel.id);
      this.notificationService.success('Region added successfully', '');
      this.regionAdded.emit(region);
    } catch (e) {
      this.handleError('Failed to add region', e);
    } finally {
      this.close();
    }
  }

  private handleError(notificationTitle: string, e: any) {
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
    if (e instanceof ImageNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image not found');
      this.location.back();
      return;
    }
    if (e instanceof InvalidRegionInformation) {
      this.notificationService.error(notificationTitle, 'Invalid region information');
      return;
    }
    if (e instanceof RegionLabelCannotBeAssignedToImageError) {
      this.notificationService.error(notificationTitle, 'Region label cannot be assigned to image of this image type');
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
