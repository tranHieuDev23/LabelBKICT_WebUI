import { Injectable } from '@angular/core';
import { UserListFilterOptionsWithMetadata } from 'src/app/components/user-filter-options-selector/user-filter-options-selector.component';
import { UserListFilterOptions } from '../../dataaccess/api';

@Injectable({
  providedIn: 'root',
})
export class FilterOptionsService {
  public getFilterOptionsFromFilterOptionsWithMetadata(
    filterOptionsWithMetadata: UserListFilterOptionsWithMetadata
  ): UserListFilterOptions {
    const filterOptions = new UserListFilterOptions();
    filterOptions.userRoleList = filterOptionsWithMetadata.userRoleList.map(
      (userRole) => userRole?.id || 0
    );
    filterOptions.userTagList = filterOptionsWithMetadata.userTagList.map(
      (userTag) => userTag?.id || 0
    );
    filterOptions.userNameQuery =
      filterOptionsWithMetadata.userNameQuery;
    return filterOptions;
  }
}
