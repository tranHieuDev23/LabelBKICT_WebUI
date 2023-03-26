import { Component, Input } from '@angular/core';
import {
  OperationType,
  RegionOperationLog,
  RegionOperationLogDrawMetadata,
  RegionOperationLogLabelMetadata,
} from 'src/app/services/dataaccess/api';
import { PaginationService } from 'src/app/services/utils/pagination/pagination.service';

@Component({
  selector: 'app-region-operation-log-list',
  templateUrl: './region-operation-log-list.component.html',
  styleUrls: ['./region-operation-log-list.component.scss'],
})
export class RegionOperationLogListComponent {
  public pageIndex = 1;
  public pageSize = 5;
  public paginatedOperationLogList: RegionOperationLog[] = [];

  private _operationLogList: RegionOperationLog[] = [];

  @Input() public set operationLogList(v: RegionOperationLog[]) {
    this._operationLogList = v;
    this.pageIndex = 1;
    this.paginatedOperationLogList = this.getPaginatedOperationLogList(this.pageIndex, this.pageSize);
  }

  public get operationLogList(): RegionOperationLog[] {
    return this._operationLogList;
  }

  constructor(private readonly paginationService: PaginationService) {}

  public isDrawOperationLog(operationLog: RegionOperationLog): boolean {
    return operationLog.operationType === OperationType.DRAW;
  }

  public isLabelOperationLog(operationLog: RegionOperationLog): boolean {
    return operationLog.operationType === OperationType.LABEL;
  }

  public isFirstDrawOperationLog(operationLog: RegionOperationLog): boolean {
    if (!(operationLog.operationMetadata instanceof RegionOperationLogDrawMetadata)) {
      return false;
    }
    return operationLog.operationMetadata.oldBorder === null || operationLog.operationMetadata.oldHoles === null;
  }

  public isFirstLabelOperationLog(operationLog: RegionOperationLog): boolean {
    if (!(operationLog.operationMetadata instanceof RegionOperationLogLabelMetadata)) {
      return false;
    }
    return operationLog.operationMetadata.oldLabel === null;
  }

  public getLabelOperationLogOldLabelDisplayName(operationLog: RegionOperationLog): string {
    if (!(operationLog.operationMetadata instanceof RegionOperationLogLabelMetadata)) {
      return '';
    }
    return operationLog.operationMetadata.oldLabel?.displayName || 'No type';
  }

  public getLabelOperationLogNewLabelDisplayName(operationLog: RegionOperationLog): string {
    if (!(operationLog.operationMetadata instanceof RegionOperationLogLabelMetadata)) {
      return '';
    }
    return operationLog.operationMetadata.newLabel?.displayName || 'No type';
  }

  public onPageIndexChanged(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.paginatedOperationLogList = this.getPaginatedOperationLogList(pageIndex, this.pageSize);
  }

  public onPageSizeChanged(pageSize: number): void {
    this.pageSize = pageSize;
    this.paginatedOperationLogList = this.getPaginatedOperationLogList(this.pageIndex, pageSize);
  }

  private getPaginatedOperationLogList(pageIndex: number, pageSize: number): RegionOperationLog[] {
    const startIndex = this.paginationService.getPageOffset(pageIndex, pageSize);
    const endIndex = Math.min(startIndex + pageSize, this._operationLogList.length);
    return this._operationLogList.slice(startIndex, endIndex);
  }
}
