import { RegionSelectorEditorSnapshot } from './region-selector-editor-snapshot';

export class RegionSelectorSnapshotService {
  private snapshotList: RegionSelectorEditorSnapshot[] = [];
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

  public storeSnapshot(snapshot: RegionSelectorEditorSnapshot): void {
    if (this.canRedo()) {
      this.snapshotList = this.snapshotList.slice(
        0,
        this.currentSnapshotID + 1
      );
    }
    this.snapshotList.push(snapshot);
    this.currentSnapshotID = this.snapshotList.length - 1;
  }

  public getCurrentSnapshot(): RegionSelectorEditorSnapshot | null {
    if (this.currentSnapshotID < 0) {
      return null;
    }
    return this.snapshotList[this.currentSnapshotID];
  }

  public undo(): RegionSelectorEditorSnapshot | null {
    if (!this.canUndo()) {
      return null;
    }
    this.currentSnapshotID--;
    return this.snapshotList[this.currentSnapshotID];
  }

  public peekUndo(): RegionSelectorEditorSnapshot | null {
    if (!this.canUndo()) {
      return null;
    }
    return this.snapshotList[this.currentSnapshotID - 1];
  }

  public redo(): RegionSelectorEditorSnapshot | null {
    if (!this.canRedo()) {
      return null;
    }
    this.currentSnapshotID++;
    return this.snapshotList[this.currentSnapshotID];
  }

  public peekRedo(): RegionSelectorEditorSnapshot | null {
    if (!this.canRedo()) {
      return null;
    }
    return this.snapshotList[this.currentSnapshotID - 1];
  }
}