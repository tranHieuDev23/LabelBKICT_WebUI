import { TestBed } from '@angular/core/testing';

import { UserPermissionManagementService } from './user-permission-management.service';

describe('UserPermissionManagementService', () => {
  let service: UserPermissionManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPermissionManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
