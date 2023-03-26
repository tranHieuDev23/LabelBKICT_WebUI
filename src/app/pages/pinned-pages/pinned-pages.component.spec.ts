import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnedPagesComponent } from './pinned-pages.component';

describe('PinnedPagesComponent', () => {
  let component: PinnedPagesComponent;
  let fixture: ComponentFixture<PinnedPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PinnedPagesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PinnedPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
