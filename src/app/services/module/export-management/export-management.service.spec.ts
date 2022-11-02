import { TestBed } from '@angular/core/testing';

import { ExportManagementService } from './export-management.service';

describe('ExportManagementService', () => {
  let service: ExportManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
