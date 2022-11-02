import { TestBed } from '@angular/core/testing';

import { PinnedPageManagementService } from './pinned-page-management.service';

describe('PinnedPageManagementService', () => {
  let service: PinnedPageManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinnedPageManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
