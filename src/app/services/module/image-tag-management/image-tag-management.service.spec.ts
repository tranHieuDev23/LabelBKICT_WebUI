import { TestBed } from '@angular/core/testing';

import { ImageTagManagementService } from './image-tag-management.service';

describe('ImageTagManagementService', () => {
  let service: ImageTagManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageTagManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
