import { ImageStatus } from './image';
import { ImageTag } from './image_tag';
import { ImageType } from './image_type';
import { RegionLabel } from './region_label';
import { User } from './user';

export class ImageListFilterOptions {
  public imageIdList: number[] = [];
  public imageTypeIDList: number[] = [];
  public imageTagIDList: number[] = [];
  public regionLabelIDList: number[] = [];
  public uploadedByUserIDList: number[] = [];
  public publishedByUserIDList: number[] = [];
  public verifiedByUserIDList: number[] = [];
  public uploadTimeStart = 0;
  public uploadTimeEnd = 0;
  public publishTimeStart = 0;
  public publishTimeEnd = 0;
  public verifyTimeStart = 0;
  public verifyTimeEnd = 0;
  public originalFilenameQuery = '';
  public imageStatusList: ImageStatus[] = [];
  public mustMatchAllImageTags = false;
  public mustMatchAllRegionLabels = false;
  public mustBeBookmarked = false;
  public mustHaveDescription = false;
}
export class ImageListFilterOptionsWithMetadata {
  public imageIdList: number[] = [];
  public imageTypeList: (ImageType | null)[] = [];
  public imageTagList: ImageTag[] = [];
  public regionLabelList: RegionLabel[] = [];
  public uploadedByUserList: User[] = [];
  public publishedByUserList: User[] = [];
  public verifiedByUserList: User[] = [];
  public uploadTimeStart = 0;
  public uploadTimeEnd = 0;
  public publishTimeStart = 0;
  public publishTimeEnd = 0;
  public verifyTimeStart = 0;
  public verifyTimeEnd = 0;
  public originalFilenameQuery = '';
  public imageStatusList: ImageStatus[] = [];
  public mustMatchAllImageTags = false;
  public mustMatchAllRegionLabels = false;
  public mustBeBookmarked = false;
  public mustHaveDescription = false;
}
