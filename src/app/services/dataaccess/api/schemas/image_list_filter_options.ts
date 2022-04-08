import { ImageStatus } from './image';

export class ImageListFilterOptions {
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
