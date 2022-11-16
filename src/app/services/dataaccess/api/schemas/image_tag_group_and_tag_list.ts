import { ImageTag } from './image_tag';
import { ImageTagGroup } from './image_tag_group';

export class ImageTagGroupAndTagList {
  constructor(
    public imageTagGroupList: ImageTagGroup[],
    public imageTagList: ImageTag[][]
  ) {}

  public static fromJSON(imageTagJSON: any): ImageTagGroupAndTagList {
    return new ImageTagGroupAndTagList(
      imageTagJSON.image_tag_group_list || [],
      imageTagJSON.image_tag_list || [[]]
    );
  }
}
