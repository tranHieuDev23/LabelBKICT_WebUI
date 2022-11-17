import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageTagGroup, ImageTag } from 'src/app/services/dataaccess/api';

@Component({
  selector: 'app-image-tag-select',
  templateUrl: './image-tag-select.component.html',
  styleUrls: ['./image-tag-select.component.scss'],
})
export class ImageTagSelectComponent {
  private _allImageTagGroupList: ImageTagGroup[] = [];

  @Input() public set allImageTagGroupList(v: ImageTagGroup[]) {
    this._allImageTagGroupList = v;
    this.updateAllowedImageTagGroupIndexList();
    this.hideAddImageTagInput();
  }

  public get allImageTagGroupList(): ImageTagGroup[] {
    return this._allImageTagGroupList;
  }

  private _allImageTagList: ImageTag[][] = [];

  @Input() public set allImageTagList(v: ImageTag[][]) {
    this._allImageTagList = v;
    this.updateAllowedImageTagGroupIndexList();
    this.hideAddImageTagInput();
  }

  public get allImageTagList(): ImageTag[][] {
    return this._allImageTagList;
  }

  private _imageTagList: ImageTag[] = [];
  private imageTagIDSet: Set<number> = new Set<number>();

  @Input() public set imageTagList(v: ImageTag[]) {
    this._imageTagList = v;
    this.imageTagIDSet = new Set(v.map((imageTag) => imageTag.id));
    this.updateAllowedImageTagGroupIndexList();
    this.hideAddImageTagInput();
  }

  public get imageTagList(): ImageTag[] {
    return this._imageTagList;
  }

  public allowedImageTagGroupIndexList: number[] = [];

  public isAddImageTagSelectVisible = false;
  public selectedImageTag: ImageTag | null = null;

  @Output() public imageTagAdded = new EventEmitter<ImageTag>();

  constructor() {}

  public isImageTagInImageTagList(imageTag: ImageTag): boolean {
    return this.imageTagIDSet.has(imageTag.id);
  }

  public showAddImageTagInput(): void {
    if (this.isAddImageTagSelectVisible) {
      return;
    }
    this.selectedImageTag = null;
    this.isAddImageTagSelectVisible = true;
  }

  public hideAddImageTagInput(): void {
    this.isAddImageTagSelectVisible = false;
  }

  public onAddImageTag(imageTag: ImageTag): void {
    if (this.isImageTagInImageTagList(imageTag)) {
      return;
    }
    this.imageTagList = [...this.imageTagList, imageTag];
    this.updateAllowedImageTagGroupIndexList();
    this.imageTagAdded.emit(imageTag);
    this.hideAddImageTagInput();
  }

  private updateAllowedImageTagGroupIndexList(): void {
    this.allowedImageTagGroupIndexList = [];
    this.allImageTagGroupList.forEach((imageTagGroup, index) => {
      if (imageTagGroup.isSingleValue) {
        for (const imageTag of this.allImageTagList[index] || []) {
          if (this.isImageTagInImageTagList(imageTag)) {
            return;
          }
        }
      }
      this.allowedImageTagGroupIndexList.push(index);
    });
  }
}
