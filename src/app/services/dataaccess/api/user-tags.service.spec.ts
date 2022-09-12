import { TestBed } from '@angular/core/testing';

import { UserTagsService } from './user-tags.service';

describe('UserTagsService', () => {
  let service: UserTagsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTagsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
