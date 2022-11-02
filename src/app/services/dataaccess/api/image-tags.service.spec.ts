import { TestBed } from '@angular/core/testing';

import { ImageTagsService } from './image-tags.service';

describe('ImageTagsService', () => {
  let service: ImageTagsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageTagsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
