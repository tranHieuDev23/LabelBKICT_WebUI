import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { SelectContainerComponent } from 'ngx-drag-to-select';
import { Image, ImageStatus, ImageTag } from 'src/app/services/dataaccess/api';
import { ImageStatusService } from 'src/app/services/module/image-management/image-status.service';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss'],
})
export class ImageGridComponent {
  @ViewChild(SelectContainerComponent)
  public selectContainer: SelectContainerComponent | undefined;

  @Input() public imageList: Image[] = [];
  @Input() public imageTagList: ImageTag[][] = [];
  @Input() public emptyText = 'There is no image';
  @Input() public loading = true;

  @Output() public imageDbClicked = new EventEmitter<number>();
  @Output() public imageListSelected = new EventEmitter<Image[]>();

  public selectedImageList: Image[] = [];

  constructor(private readonly imageStatusService: ImageStatusService) {}

  public getImageStatusColor(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusColor(status);
  }

  public getImageStatusString(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusString(status);
  }

  public onImageDbClick(id: number): void {
    this.imageDbClicked.emit(id);
  }

  public onImageListSelected(): void {
    this.imageListSelected.emit(this.selectedImageList);
  }

  public onSelectAllClicked(): void {
    this.selectContainer?.selectAll();
  }

  public onImageContextMenu(selectedImage: Image): void {
    if (this.selectedImageList.length < 2) {
      this.selectContainer?.clearSelection();
      this.selectContainer?.selectItems(
        (image: Image) => image.id === selectedImage.id
      );
      this.onImageListSelected();
    }
  }
}
