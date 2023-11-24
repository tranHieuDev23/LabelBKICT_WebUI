import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { QuillModules } from 'ngx-quill';
import {
  ImageOrPointOfInterestNotFound,
  InvalidPointOfInterestInformationError,
  PointOfInterest,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';

@Component({
  selector: 'app-update-poi-modal',
  templateUrl: './update-poi-modal.component.html',
  styleUrls: ['./update-poi-modal.component.scss'],
})
export class UpdatePoiModalComponent {
  private imageID: number | undefined;
  private poi: PointOfInterest | undefined;
  public description = '';

  @Output() public poiUpdated = new EventEmitter<PointOfInterest>();

  constructor(
    private readonly imageManagementService: ImageManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router
  ) {}

  public visible = false;
  public quillModules: QuillModules = {
    toolbar: [
      [
        'bold',
        'italic',
        'underline',
        { list: 'ordered' },
        { list: 'bullet' },
        { script: 'sub' },
        { script: 'super' },
        { color: [] },
        { background: [] },
        { align: [] },
        'link',
      ],
    ],
  };

  public open(imageID: number, poi: PointOfInterest) {
    this.imageID = imageID;
    this.poi = poi;
    this.description = poi.description;
    this.visible = true;
  }

  public async onOkClicked(): Promise<void> {
    if (!this.imageID || !this.poi) {
      return;
    }

    this.visible = false;
    try {
      const pointOfInterest = await this.imageManagementService.updatePointOfInterestOfImage(
        this.imageID,
        this.poi.id,
        this.poi.coordinate,
        this.description
      );
      this.notificationService.success('Point of interest updated successfully', '');
      this.poiUpdated.emit(pointOfInterest);
    } catch (e) {
      this.handleError('Failed to update point of interest', e);
    }
  }

  public onCancelClicked(): void {
    this.visible = false;
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
    if (e instanceof InvalidPointOfInterestInformationError) {
      this.notificationService.error(notificationTitle, 'Invalid point of interest information');
      return;
    }
    if (e instanceof ImageOrPointOfInterestNotFound) {
      this.notificationService.error(notificationTitle, 'Image or point of interest not found');
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
