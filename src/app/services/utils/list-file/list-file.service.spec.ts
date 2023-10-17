import { TestBed } from '@angular/core/testing';

import { ListFileService } from './list-file.service';

describe('ListFileService', () => {
  let service: ListFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
