import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Region } from 'src/app/services/dataaccess/api';
import { FreePolygon } from '../region-selector/models';
import { NzTableSortOrder } from 'ng-zorro-antd/table';
import { RegionImageService } from 'src/app/services/module/region-management/region-image.service';

export interface RegionListData {
  region: Region;
  image: string;
  checked: boolean;
}

export interface RegionListColumn {
  name: string;
  sortFunc: (a: RegionListData, b: RegionListData) => number;
  sortDirection: NzTableSortOrder;
}

export interface RegionListCheckedChangeEvent {
  checkedRegionList: Region[];
}

@Component({
  selector: 'app-region-list',
  templateUrl: './region-list.component.html',
  styleUrls: ['./region-list.component.scss'],
})
export class RegionListComponent {
  private _imageSrc: string = '';

  @Input()
  public set imageSrc(v: string) {
    this._imageSrc = v;
    this.updateRegionListDataList().then();
  }

  public get imageSrc(): string {
    return this._imageSrc;
  }

  private _regionList: Region[] = [];

  @Input()
  public set regionList(v: Region[]) {
    this._regionList = v;
    this.updateRegionListDataList().then();
  }

  @Output()
  public regionListCheckedChange = new EventEmitter<RegionListCheckedChangeEvent>();

  private _regionListDataList: RegionListData[] = [];

  public get regionListDataList(): RegionListData[] {
    return this._regionListDataList;
  }

  public allRowsChecked: boolean = false;

  public columnList: RegionListColumn[] = [
    {
      name: 'Region',
      sortFunc: (a: RegionListData, b: RegionListData): number => {
        const areaA = new FreePolygon(a.region.border.vertices).getArea();
        const areaB = new FreePolygon(b.region.border.vertices).getArea();
        return areaA - areaB;
      },
      sortDirection: null,
    },
    {
      name: 'Drawn by',
      sortFunc: (a: RegionListData, b: RegionListData): number => {
        if (a.region.drawnByUser === null && b.region.drawnByUser === null) {
          return a.region.id - b.region.id;
        }

        if (a.region.drawnByUser === null) {
          return -1;
        }

        if (b.region.drawnByUser === null) {
          return 1;
        }

        return a.region.drawnByUser.displayName.localeCompare(b.region.drawnByUser.displayName);
      },
      sortDirection: null,
    },
    {
      name: 'Labeled by',
      sortFunc: (a: RegionListData, b: RegionListData): number => {
        if (a.region.labeledByUser === null && b.region.labeledByUser === null) {
          return a.region.id - b.region.id;
        }

        if (a.region.labeledByUser === null) {
          return -1;
        }

        if (b.region.labeledByUser === null) {
          return 1;
        }

        return a.region.labeledByUser.displayName.localeCompare(b.region.labeledByUser.displayName);
      },
      sortDirection: null,
    },
    {
      name: 'Label',
      sortFunc: (a: RegionListData, b: RegionListData): number => {
        if (a.region.label === null && b.region.label === null) {
          return a.region.id - b.region.id;
        }

        if (a.region.label === null) {
          return -1;
        }

        if (b.region.label === null) {
          return 1;
        }

        return a.region.label.displayName.localeCompare(b.region.label.displayName);
      },
      sortDirection: null,
    },
  ];

  constructor(private readonly regionImageService: RegionImageService) {}

  private async updateRegionListDataList() {
    this._regionListDataList = await Promise.all(
      this._regionList.map(async (region) => {
        const image = await this.regionImageService.generateRegionImage(this.imageSrc, region.border);
        return { region, image, checked: false };
      })
    );
  }

  public onAllRowsCheckedChange(): void {
    for (let i = 0; i < this._regionListDataList.length; i++) {
      this._regionListDataList[i].checked = this.allRowsChecked;
    }
    this.emitRegionListCheckedChangeEvent();
  }

  public onRowCheckedChange(): void {
    this.allRowsChecked = true;
    for (let i = 0; i < this._regionListDataList.length; i++) {
      this.allRowsChecked &&= this._regionListDataList[i].checked;
    }
    this.emitRegionListCheckedChangeEvent();
  }

  private emitRegionListCheckedChangeEvent(): void {
    const checkedRegionList = this._regionListDataList.filter((data) => data.checked).map((data) => data.region);
    this.regionListCheckedChange.emit({ checkedRegionList });
  }
}
