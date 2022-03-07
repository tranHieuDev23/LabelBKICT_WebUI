import { TestBed } from '@angular/core/testing';

import { UserRoleManagementService } from './user-role-management.service';

describe('UserRoleManagementService', () => {
  let service: UserRoleManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserRoleManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
