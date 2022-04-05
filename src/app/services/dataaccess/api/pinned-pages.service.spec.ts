import { TestBed } from '@angular/core/testing';

import { PinnedPagesService } from './pinned-pages.service';

describe('PinnedPagesService', () => {
  let service: PinnedPagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinnedPagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
