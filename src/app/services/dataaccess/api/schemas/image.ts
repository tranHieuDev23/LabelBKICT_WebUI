import { ImageType } from './image_type';
import { User } from './user';

export enum ImageStatus {
  UPLOADED = 0,
  PUBLISHED = 1,
  VERIFIED = 2,
  EXCLUDED = 3,
}

export class Image {
  constructor(
    public id: number,
    public uploadedByUser: User,
    public uploadTime: number,
    public publishedByUser: User | null,
    public publishTime: number,
    public verifiedByUser: User | null,
    public verifyTime: number,
    public originalFileName: string,
    public originalImageURL: string,
    public thumbnailURL: string,
    public description: string,
    public imageType: ImageType | null,
    public status: ImageStatus
  ) {}

  public static fromJSON(imageJSON: any): Image {
    return new Image(
      imageJSON.id || 0,
      User.fromJSON(imageJSON.uploaded_by_user),
      imageJSON.upload_time || 0,
      imageJSON.published_by_user ? User.fromJSON(imageJSON.published_by_user) : null,
      imageJSON.publish_time || 0,
      imageJSON.verified_by_user ? User.fromJSON(imageJSON.verified_by_user) : null,
      imageJSON.verify_time || 0,
      imageJSON.original_file_name || '',
      imageJSON.original_image_url || '',
      imageJSON.thumbnail_url || '',
      imageJSON.description || '',
      imageJSON.image_type ? ImageType.fromJSON(imageJSON.image_type) : null,
      imageJSON.status
    );
  }
}
