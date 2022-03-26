import { TestBed } from '@angular/core/testing';

import { DescriptionFileService } from './description-file.service';

describe('DescriptionFileService', () => {
  let service: DescriptionFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DescriptionFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
