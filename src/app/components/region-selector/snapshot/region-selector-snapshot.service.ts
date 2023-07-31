import { Injectable } from '@angular/core';
import { RegionSelectorSnapshot } from './region-selector-editor-snapshot';

@Injectable({
  providedIn: 'root',
})
export class RegionSelectorSnapshotService {
  private snapshotList: RegionSelectorSnapshot[] = [];
  private currentSnapshotID: number = -1;

  public clear(): void {
    this.snapshotList = [];
    this.currentSnapshotID = -1;
  }

  public snapshotSize(): number {
    return this.snapshotList.length;
  }

  public canUndo(): boolean {
    return this.currentSnapshotID > 0;
  }

  public canRedo(): boolean {
    return this.currentSnapshotID < this.snapshotList.length - 1;
  }

  public storeSnapshot(snapshot: RegionSelectorSnapshot): void {
    if (this.canRedo()) {
      this.snapshotList = this.snapshotList.slice(0, this.currentSnapshotID + 1);
    }
    this.snapshotList.push(snapshot);
    this.currentSnapshotID = this.snapshotList.length - 1;
  }

  public getCurrentSnapshot(): RegionSelectorSnapshot | null {
    if (this.currentSnapshotID < 0) {
      return null;
    }
    return this.snapshotList[this.currentSnapshotID];
  }

  public undo(): RegionSelectorSnapshot | null {
    if (!this.canUndo()) {
      return null;
    }
    this.currentSnapshotID--;
    return this.snapshotList[this.currentSnapshotID];
  }

  public peekUndo(): RegionSelectorSnapshot | null {
    if (!this.canUndo()) {
      return null;
    }
    return this.snapshotList[this.currentSnapshotID - 1];
  }

  public redo(): RegionSelectorSnapshot | null {
    if (!this.canRedo()) {
      return null;
    }
    this.currentSnapshotID++;
    return this.snapshotList[this.currentSnapshotID];
  }

  public peekRedo(): RegionSelectorSnapshot | null {
    if (!this.canRedo()) {
      return null;
    }
    return this.snapshotList[this.currentSnapshotID - 1];
  }
}
