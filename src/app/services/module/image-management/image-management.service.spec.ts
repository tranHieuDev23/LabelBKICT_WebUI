import { TestBed } from '@angular/core/testing';

import { ImageManagementService } from './image-management.service';

describe('ImageManagementService', () => {
  let service: ImageManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
