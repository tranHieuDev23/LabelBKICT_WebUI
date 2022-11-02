import { TestBed } from '@angular/core/testing';

import { ImageTypeManagementService } from './image-type-management.service';

describe('ImageTypeManagementService', () => {
  let service: ImageTypeManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageTypeManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
