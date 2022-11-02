import { TestBed } from '@angular/core/testing';

import { ImageStatusService } from './image-status.service';

describe('ImageStatusService', () => {
  let service: ImageStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
