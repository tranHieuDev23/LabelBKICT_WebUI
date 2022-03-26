import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageTag, ImageTagGroup } from 'src/app/services/dataaccess/api';

@Component({
  selector: 'app-editable-tag-list',
  templateUrl: './editable-tag-list.component.html',
  styleUrls: ['./editable-tag-list.component.scss'],
})
export class EditableTagListComponent {
  @Input() public allImageTagGroupList: ImageTagGroup[] = [];
  @Input() public allImageTagList: ImageTag[][] = [];

  private _editable = true;

  @Input() public set editable(v: boolean) {
    this._editable = v;
    this.hideAddImageTagInput();
  }

  public get editable(): boolean {
    return this._editable;
  }

  public allowedImageTagGroupIndexList: number[] = [];

  private _imageTagList: ImageTag[] = [];
  private imageTagIdSet: Set<number> = new Set<number>();

  @Input() public set imageTagList(v: ImageTag[]) {
    this._imageTagList = v;
    this.imageTagIdSet = new Set(v.map((imageTag) => imageTag.id));
    this.hideAddImageTagInput();
  }

  public get imageTagList(): ImageTag[] {
    return this._imageTagList;
  }

  public isAddImageTagSelectVisible = false;
  public selectedImageTag: ImageTag | null = null;

  @Output() public imageTagDeleted = new EventEmitter<ImageTag>();
  @Output() public imageTagAdded = new EventEmitter<ImageTag>();

  constructor() {}

  public isImageTagInImageTagList(imageTag: ImageTag): boolean {
    return this.imageTagIdSet.has(imageTag.id);
  }

  public onDeleteImageTag(imageTag: ImageTag): void {
    if (!this.isImageTagInImageTagList(imageTag)) {
      return;
    }
    this.imageTagList = this.imageTagList.filter(
      (item) => item.id !== imageTag.id
    );
    this.updateAllowedImageTagGroupIndexList();
    this.imageTagDeleted.emit(imageTag);
  }

  public showAddImageTagInput(): void {
    if (this.isAddImageTagSelectVisible) {
      return;
    }
    this.selectedImageTag = null;
    this.isAddImageTagSelectVisible = true;
  }

  public hideAddImageTagInput(): void {
    if (!this.isAddImageTagSelectVisible) {
      return;
    }
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
    this.allImageTagGroupList.forEach((_, index) => {
      for (const imageTag of this.allImageTagList[index]) {
        if (this.isImageTagInImageTagList(imageTag)) {
          return;
        }
      }
      this.allowedImageTagGroupIndexList.push(index);
    });
  }
}
