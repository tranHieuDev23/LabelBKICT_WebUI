import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyImagesComponent } from './verify-images.component';

describe('VerifyImagesComponent', () => {
  let component: VerifyImagesComponent;
  let fixture: ComponentFixture<VerifyImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyImagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
