import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageTag, ImageTagGroup } from 'src/app/services/dataaccess/api';

@Component({
  selector: 'app-addable-tag-list',
  templateUrl: './addable-tag-list.component.html',
  styleUrls: ['./addable-tag-list.component.scss'],
})
export class AddableTagListComponent {
  @Input() public editable: boolean = true;
  @Input() public allImageTagGroupList: ImageTagGroup[] = [];
  @Input() public allImageTagList: ImageTag[][] = [];

  private _currentImageTagList: ImageTag[] = [];
  private _addedImageTagList: ImageTag[] = [];
  private _newImageTagList: ImageTag[] = [];
  private addedImageTagIdSet: Set<number> = new Set<number>();
  private newImageTagIdSet: Set<number> = new Set<number>();

  @Input() public set currentImageTagList(v: ImageTag[]) {
    this.updateCurrentAndAddedImageTagList(v, this._addedImageTagList);
  }

  @Input() public set addedImageTagList(v: ImageTag[]) {
    this.updateCurrentAndAddedImageTagList(this._currentImageTagList, v);
  }

  public get addedImageTagList(): ImageTag[] {
    return this._addedImageTagList;
  }

  public get newImageTagList(): ImageTag[] {
    return this._newImageTagList;
  }

  @Output() public imageTagDeleted = new EventEmitter<ImageTag>();
  @Output() public imageTagAdded = new EventEmitter<ImageTag>();

  constructor() {}

  public onDeleteImageTag(deletedImageTag: ImageTag): void {
    if (!this.addedImageTagIdSet.has(deletedImageTag.id)) {
      return;
    }
    this.updateCurrentAndAddedImageTagList(
      this._currentImageTagList,
      this._addedImageTagList.filter(
        (imageTag) => imageTag.id !== deletedImageTag.id
      )
    );
    this.imageTagDeleted.emit(deletedImageTag);
  }

  public onAddImageTag(addedImageTag: ImageTag): void {
    if (this.newImageTagIdSet.has(addedImageTag.id)) {
      return;
    }
    this.updateCurrentAndAddedImageTagList(this._currentImageTagList, [
      ...this._addedImageTagList,
      addedImageTag,
    ]);
    this.imageTagAdded.emit(addedImageTag);
  }

  private updateCurrentAndAddedImageTagList(
    currentImageTagList: ImageTag[],
    addedImageTagList: ImageTag[]
  ): void {
    this._currentImageTagList = currentImageTagList;
    this._addedImageTagList = addedImageTagList;
    this._newImageTagList = [...currentImageTagList, ...addedImageTagList];
    this.addedImageTagIdSet = new Set(
      addedImageTagList.map((imageTag) => imageTag.id)
    );
    this.newImageTagIdSet = new Set(
      this._newImageTagList.map((imageTag) => imageTag.id)
    );
  }
}
