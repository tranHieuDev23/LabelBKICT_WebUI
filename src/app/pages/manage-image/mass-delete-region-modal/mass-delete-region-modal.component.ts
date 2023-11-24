import { Location } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionListCheckedChangeEvent } from 'src/app/components/region-list/region-list.component';
import {
  Image,
  ImageNotFoundError,
  Region,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { RegionManagementService } from 'src/app/services/module/region-management/region-management.service';

@Component({
  selector: 'app-mass-delete-region-modal',
  templateUrl: './mass-delete-region-modal.component.html',
  styleUrls: ['./mass-delete-region-modal.component.scss'],
})
export class MassDeleteRegionModalComponent {
  public visible = false;
  public image: Image | undefined;
  public regionList: Region[] = [];
  public deletedRegionList: Region[] = [];

  @Output() public massRegionDeleted = new EventEmitter<Region[]>();

  constructor(
    private readonly regionManagementService: RegionManagementService,
    private readonly modalService: NzModalService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  public open(image: Image, regionList: Region[]): void {
    this.image = image;
    this.regionList = regionList;
    this.deletedRegionList = [];
    this.visible = true;
  }

  public close(): void {
    this.visible = false;
  }

  public async onDeleteClicked(): Promise<void> {
    if (!this.image) {
      return;
    }

    this.modalService.create({
      nzTitle: 'Delete selected regions of image',
      nzContent: '<p>Are you sure? This action is <b>IRREVERSIBLE</b>.</p>',
      nzOkDanger: true,
      nzOnOk: async () => {
        if (!this.image) {
          return;
        }
        const deletedRegionIDList = this.deletedRegionList.map((region) => region.id);
        try {
          await this.regionManagementService.deleteRegionList(this.image.id, deletedRegionIDList);
        } catch (e) {
          this.handleError('Failed to delete selected regions of image', e);
          return;
        }
        this.notificationService.success('Deleted selected regions of image successfully', '');
        this.massRegionDeleted.emit(this.deletedRegionList);
        this.close();
      },
    });
  }

  public onRegionListCheckedChange(event: RegionListCheckedChangeEvent): void {
    this.deletedRegionList = event.checkedRegionList;
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
    if (e instanceof ImageNotFoundError) {
      this.notificationService.error(notificationTitle, 'Image not found');
      this.location.back();
      return;
    }
    this.notificationService.error(notificationTitle, 'Unknown error');
  }
}
