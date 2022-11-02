import { TestBed } from '@angular/core/testing';

import { ImageListManagementService } from './image-list-management.service';

describe('ImageListManagementService', () => {
  let service: ImageListManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageListManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
