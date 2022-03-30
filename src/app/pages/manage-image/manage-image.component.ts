import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EditableTextComponent } from 'src/app/components/editable-text/editable-text.component';
import { Polygon } from 'src/app/components/region-selector/models';
import { RegionSelectorComponent } from 'src/app/components/region-selector/region-selector.component';
import {
  Image,
  ImageListFilterOptions,
  ImageNotFoundError,
  ImageTag,
  Region,
  UnauthenticatedError,
  UnauthorizedError,
} from 'src/app/services/dataaccess/api';
import { ImageManagementService } from 'src/app/services/module/image-management';
import { SessionManagementService } from 'src/app/services/module/session-management';
import { JSONCompressService } from 'src/app/services/utils/json-compress/json-compress.service';

@Component({
  selector: 'app-manage-image',
  templateUrl: './manage-image.component.html',
  styleUrls: ['./manage-image.component.scss'],
})
export class ManageImageComponent implements OnInit {
  @ViewChild(RegionSelectorComponent, { static: false })
  public regionSelector: RegionSelectorComponent | undefined;
  @ViewChild('descriptionEditableText', { static: false })
  public descriptionEditableText: EditableTextComponent | undefined;
  @ViewChild('contextMenu', { static: false })
  public contextMenu: NzDropdownMenuComponent | undefined;

  public image: Image | undefined;
  public imageTagList: ImageTag[] = [];
  public regionList: Region[] = [];

  private filterOptions: ImageListFilterOptions | undefined;

  public selectedRegion: Polygon[] = [];

  constructor(
    private readonly sessionManagementService: SessionManagementService,
    private readonly imageManagementService: ImageManagementService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly router: Router,
    private readonly notificationService: NzNotificationService,
    private readonly jsonCompress: JSONCompressService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.onParamsChanged(params);
    });
    this.route.queryParams.subscribe(async (params) => {
      this.onQueryParamsChanged(params);
    });
  }

  private async onParamsChanged(params: Params): Promise<void> {
    const imageID = +params['id'];
    await this.loadImage(imageID);
  }

  private async loadImage(imageID: number): Promise<void> {
    try {
      const { image, imageTagList, regionList } =
        await this.imageManagementService.getImage(imageID);
      this.image = image;
      this.imageTagList = imageTagList;
      this.regionList = regionList;
      window.scrollTo(0, 0);
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        this.notificationService.error(
          'Failed to load image',
          'User is not logged in'
        );
        this.router.navigateByUrl('/login');
      } else if (e instanceof UnauthorizedError) {
        this.notificationService.error(
          'Failed to load image',
          'User does not have the required permission'
        );
        this.location.back();
      } else if (e instanceof ImageNotFoundError) {
        this.notificationService.error(
          'Failed to load image',
          'Image not found'
        );
        this.location.back();
      }
    }
  }

  private async onQueryParamsChanged(queryParams: Params): Promise<void> {
    const filterParam = queryParams['filter'];
    if (filterParam !== undefined) {
      this.filterOptions = this.jsonCompress.decompress(filterParam);
    } else {
      const authUserInfo =
        await this.sessionManagementService.getUserFromSession();
      if (authUserInfo === null) {
        return;
      }
      this.filterOptions = this.getDefaultFilterOptions(authUserInfo.user.id);
    }
  }

  private getDefaultFilterOptions(
    sessionUserID: number
  ): ImageListFilterOptions {
    const filterOptions = new ImageListFilterOptions();
    filterOptions.uploadedByUserIDList = [sessionUserID];
    return filterOptions;
  }
}
