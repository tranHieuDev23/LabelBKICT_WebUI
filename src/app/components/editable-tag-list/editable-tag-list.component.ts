import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageTag, ImageTagGroup } from 'src/app/services/dataaccess/api';

@Component({
  selector: 'app-editable-tag-list',
  templateUrl: './editable-tag-list.component.html',
  styleUrls: ['./editable-tag-list.component.scss'],
})
export class EditableTagListComponent {
  @Input() public editable: boolean = true;
  @Input() public allImageTagGroupList: ImageTagGroup[] = [];
  @Input() public allImageTagList: ImageTag[][] = [];

  private _imageTagList: ImageTag[] = [];
  private imageTagIdSet: Set<number> = new Set<number>();

  @Input() public set imageTagList(v: ImageTag[]) {
    this._imageTagList = v;
    this.imageTagIdSet = new Set(v.map((imageTag) => imageTag.id));
  }

  public get imageTagList(): ImageTag[] {
    return this._imageTagList;
  }

  @Output() public imageTagDeleted = new EventEmitter<ImageTag>();
  @Output() public imageTagAdded = new EventEmitter<ImageTag>();

  constructor() {}

  public onDeleteImageTag(imageTag: ImageTag): void {
    if (!this.isImageTagInImageTagList(imageTag)) {
      return;
    }
    this.imageTagList = this.imageTagList.filter(
      (item) => item.id !== imageTag.id
    );
    this.imageTagDeleted.emit(imageTag);
  }

  public onAddImageTag(imageTag: ImageTag): void {
    if (this.isImageTagInImageTagList(imageTag)) {
      return;
    }
    this.imageTagList = [...this.imageTagList, imageTag];
    this.imageTagAdded.emit(imageTag);
  }

  private isImageTagInImageTagList(imageTag: ImageTag): boolean {
    return this.imageTagIdSet.has(imageTag.id);
  }
}
