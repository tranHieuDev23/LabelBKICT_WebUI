import { ImageTag } from './image_tag';
import { ImageTagGroup } from './image_tag_group';

export class ImageTagGroupAndTagList {
  constructor(
    public imageTagGroupList: ImageTagGroup[],
    public imageTagList: ImageTag[][]
  ) {}

  public static fromJSON(imageTagJSON: any): ImageTagGroupAndTagList {
    const imageTagGroupList = imageTagJSON.image_tag_group_list.map(
      ImageTagGroup.fromJSON
    );
    const imageTagList: ImageTag[][] = imageTagJSON.image_tag_list.map(
      (ImageTagSublist: any[]) => ImageTagSublist.map(ImageTag.fromJSON)
    );
    return new ImageTagGroupAndTagList(imageTagGroupList, imageTagList);
  }
}
