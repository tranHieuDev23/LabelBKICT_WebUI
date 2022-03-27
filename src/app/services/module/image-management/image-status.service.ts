import { Injectable } from '@angular/core';
import { ImageStatus } from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class ImageStatusService {
  public getImageStatusString(status: ImageStatus): string {
    switch (status) {
      case ImageStatus.UPLOADED:
        return 'Uploaded';
      case ImageStatus.PUBLISHED:
        return 'Published';
      case ImageStatus.VERIFIED:
        return 'Verified';
      case ImageStatus.EXCLUDED:
        return 'Excluded';
    }
  }

  public getImageStatusColor(status: ImageStatus): string {
    switch (status) {
      case ImageStatus.UPLOADED:
        return 'red';
      case ImageStatus.PUBLISHED:
        return 'cyan';
      case ImageStatus.VERIFIED:
        return 'green';
      case ImageStatus.EXCLUDED:
        return 'purple';
    }
  }
}
