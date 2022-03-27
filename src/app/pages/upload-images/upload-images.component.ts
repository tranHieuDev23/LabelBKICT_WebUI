import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  NzNotificationData,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import {
  ImageTag,
  ImageTagGroup,
  ImageTagsService,
  ImageType,
  ImageTypesService,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';

const NOTIFICATION_DURATION = 6000;
const NOTIFICATION_SHOW_LIMIT = 8;

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.scss'],
})
export class UploadImagesComponent implements OnInit {
  @ViewChild('successFullNotification', { static: false })
  public successFullNotificationTemplate: TemplateRef<{}> | undefined;
  @ViewChild('successBriefNotification', { static: false })
  public successBriefNotificationTemplate: TemplateRef<{}> | undefined;
  @ViewChild('failureBriefNotification', { static: false })
  public failureBriefNotificationTemplate: TemplateRef<{}> | undefined;

  public allImageTypeList: ImageType[] = [];

  public successCount = 0;
  public failureCount = 0;

  private notificationCount = 0;
  private exceedingSuccessCount = 0;
  private exceedingFailureCount = 0;
  private successNotificationRef: NzNotificationData | null = null;
  private failureNotificationRef: NzNotificationData | null = null;

  constructor(
    private readonly imageTypesService: ImageTypesService,
    private readonly notificationService: NzNotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    (async () => {
      try {
        const { imageTypeList } = await this.imageTypesService.getImageTypeList(
          false
        );
        this.allImageTypeList = imageTypeList;
      } catch (e) {
        if (e instanceof UnauthenticatedError) {
          this.notificationService.error(
            'Failed to load page',
            'User is not logged in'
          );
          this.router.navigateByUrl('/login');
        } else if (e instanceof UnauthorizedError) {
          this.notificationService.error(
            'Failed to load page',
            'User does not have the required permission'
          );
          this.router.navigateByUrl('/welcome');
        } else {
          console.log(e);
          this.notificationService.error(
            'Failed to load page',
            'Unknown error'
          );
          this.router.navigateByUrl('/welcome');
        }
      }
    })().then();
  }

  public onUploadSuccess(file: NzUploadFile): void {
    this.successCount++;
    if (this.notificationCount <= NOTIFICATION_SHOW_LIMIT) {
      this.showSuccessFullNotification(file);
    } else {
      this.showSuccessBriefNotification();
    }
  }

  private showSuccessFullNotification(file: NzUploadFile): void {
    if (this.successFullNotificationTemplate === undefined) {
      return;
    }
    const notificationTemplate = this.successFullNotificationTemplate;
    this.notificationCount++;
    const reader: FileReader = new FileReader();
    reader.onloadend = () => {
      const ref = this.notificationService.template(notificationTemplate, {
        nzDuration: NOTIFICATION_DURATION,
        nzData: {
          imgSrc: reader.result,
        },
      });
      ref.onClose.subscribe(() => {
        this.notificationCount--;
      });
    };
    reader.readAsDataURL(file as any);
  }

  private showSuccessBriefNotification(): void {
    if (this.successBriefNotificationTemplate === undefined) {
      return;
    }
    if (!this.successNotificationRef) {
      this.exceedingSuccessCount++;
      this.notificationCount++;
      this.successNotificationRef = this.notificationService.template(
        this.successBriefNotificationTemplate,
        { nzDuration: 0 }
      );
      this.successNotificationRef?.onClose?.subscribe(() => {
        this.notificationCount--;
      });
    }
    setTimeout(() => {
      this.exceedingSuccessCount--;
      if (this.exceedingSuccessCount === 0) {
        this.notificationService.remove(this.successNotificationRef?.messageId);
        this.successNotificationRef = null;
      }
    }, NOTIFICATION_DURATION);
  }

  public onUploadFailure(file: NzUploadFile): void {
    this.failureCount++;
    this.showFailureNotification();
  }

  private showFailureNotification(): void {
    if (this.failureBriefNotificationTemplate === undefined) {
      return;
    }
    if (!this.failureNotificationRef) {
      this.exceedingFailureCount++;
      this.notificationCount++;
      this.failureNotificationRef = this.notificationService.template(
        this.failureBriefNotificationTemplate,
        { nzDuration: 0 }
      );
      this.failureNotificationRef?.onClose?.subscribe(() => {
        this.notificationCount--;
      });
    }
    setTimeout(() => {
      this.exceedingFailureCount--;
      if (this.exceedingFailureCount === 0) {
        this.notificationService.remove(this.failureNotificationRef?.messageId);
        this.failureNotificationRef = null;
      }
    }, NOTIFICATION_DURATION);
  }
}
