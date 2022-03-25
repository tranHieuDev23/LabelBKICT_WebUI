import { TestBed } from '@angular/core/testing';

import { ImageTypesService } from './image-types.service';

describe('ImageTypesService', () => {
  let service: ImageTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
