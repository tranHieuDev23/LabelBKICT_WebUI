import { ImageTag } from "./image_tag";
import { ImageTagGroup } from "./image_tag_group";

export class ImageTagGroupAndTagList {
  constructor(
    public imageTagGroupList: ImageTagGroup[], 
    public imageTagListOfImageTagGroupList: ImageTag[][]
    ) {}

  public static fromJSON(imageTagJSON: any): ImageTagGroupAndTagList {
    return new ImageTagGroupAndTagList(imageTagJSON.image_tag_group_list || [], 
      imageTagJSON.image_tag_list_of_image_tag_group_list || [[]]);
  }
}
