import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { QuillModules } from 'ngx-quill';
import { Coordinate } from 'src/app/components/region-selector/models';
import {
  ImageNotFoundError,
  InvalidPointOfInterestInformationError,
  PointOfInterest,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';

@Component({
  selector: 'app-add-poi-modal',
  templateUrl: './add-poi-modal.component.html',
  styleUrls: ['./add-poi-modal.component.scss'],
})
export class AddPoiModalComponent {
  @Input() public imageID: number | undefined;
  @Input() public poiCoordinate: Coordinate | undefined;
  public description = '';

  @Output() public poiAdded = new EventEmitter<PointOfInterest>();

  constructor(
    private readonly imageManagementService: ImageManagementService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router,
    private readonly location: Location
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

  public open(imageID: number, poiCoordinate: Coordinate) {
    this.imageID = imageID;
    this.poiCoordinate = poiCoordinate;
    this.description = '';
    this.visible = true;
  }

  public async onOkClicked(): Promise<void> {
    if (!this.imageID || !this.poiCoordinate) {
      return;
    }
    this.visible = false;
    try {
      const pointOfInterest = await this.imageManagementService.addPointOfInterestToImage(
        this.imageID,
        this.poiCoordinate,
        this.description
      );
      this.notificationService.success('Point of interest added successfully', '');
      this.poiAdded.emit(pointOfInterest);
    } catch (e) {
      this.handleError('Failed to add point of interest', e);
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
    if (e instanceof ImageNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image not found');
      this.location.back();
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
