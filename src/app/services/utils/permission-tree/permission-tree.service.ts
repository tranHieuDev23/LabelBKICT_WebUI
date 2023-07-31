import { Injectable } from '@angular/core';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { UserPermission } from '../../dataaccess/api';

export interface PermissionTreeNode extends NzTreeNodeOptions {
  userPermission?: UserPermission;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionTreeService {
  public getPermissionTree(userPermissionList: UserPermission[]): PermissionTreeNode[] {
    const permissionTreeRootList: PermissionTreeNode[] = [];

    let currentPath: string[] = [];
    let currentPathNodeList: PermissionTreeNode[] = [];

    for (const userPermission of userPermissionList) {
      const { permissionName } = userPermission;
      const newPath = permissionName.split('.');

      const commonPrefixLength = this.getCommonPrefixLength(currentPath, newPath);

      const newPathNodeList = currentPathNodeList.slice(0, commonPrefixLength);
      for (let i = commonPrefixLength; i < newPath.length; i++) {
        const pathString = newPath[i];
        const isLeaf = i === newPath.length - 1;
        if (i === 0) {
          const newNode: PermissionTreeNode = {
            key: pathString,
            title: pathString,
            children: [],
            isLeaf,
            selectable: false,
            expanded: true,
          };
          if (isLeaf) newNode.userPermission = userPermission;
          permissionTreeRootList.push(newNode);
          newPathNodeList.push(newNode);
          continue;
        }

        const lastNode = newPathNodeList[i - 1];
        const newNode: PermissionTreeNode = {
          key: `${lastNode.key}.${pathString}`,
          title: pathString,
          children: [],
          isLeaf,
          selectable: false,
          expanded: true,
        };
        if (isLeaf) newNode.userPermission = userPermission;
        lastNode.children?.push(newNode);
        newPathNodeList.push(newNode);
      }

      currentPath = newPath;
      currentPathNodeList = newPathNodeList;
    }

    return permissionTreeRootList;
  }

  private getCommonPrefixLength(pathA: string[], pathB: string[]): number {
    const minLength = Math.min(pathA.length, pathB.length);
    for (let i = 0; i < minLength; i++) {
      if (pathA[i] !== pathB[i]) {
        return i;
      }
    }
    return minLength;
  }
}
