import { TestBed } from '@angular/core/testing';

import { UserTagManagementService } from './user-tag-management.service';

describe('UserTagManagementService', () => {
  let service: UserTagManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTagManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
