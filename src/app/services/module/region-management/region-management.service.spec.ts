import { TestBed } from '@angular/core/testing';

import { RegionManagementService } from './region-management.service';

describe('RegionManagementService', () => {
  let service: RegionManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegionManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
