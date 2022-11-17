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
  @Output() public imageListSelected = new EventEmitter<number[]>();

  public selectedIndexList: number[] = [];

  constructor(private readonly imageStatusService: ImageStatusService) {}

  public getImageStatusColor(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusColor(status);
  }

  public getImageStatusString(status: ImageStatus): string {
    return this.imageStatusService.getImageStatusString(status);
  }

  public onImageDbClick(index: number): void {
    this.imageDbClicked.emit(index - 1);
  }

  public onImageListSelected(): void {
    this.imageListSelected.emit(
      this.selectedIndexList.map((index) => index - 1)
    );
  }

  public onSelectAllClicked(): void {
    this.selectContainer?.selectAll();
  }

  public onImageContextMenu(selectedIndex: number): void {
    if (this.selectedIndexList.length >= 2) {
      return;
    }
    this.selectContainer?.clearSelection();
    this.selectContainer?.selectItems(
      (index: number) => index === selectedIndex
    );
    this.onImageListSelected();
  }
}
