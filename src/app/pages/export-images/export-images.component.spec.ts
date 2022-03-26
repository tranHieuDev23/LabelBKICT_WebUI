import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportImagesComponent } from './export-images.component';

describe('ExportImagesComponent', () => {
  let component: ExportImagesComponent;
  let fixture: ComponentFixture<ExportImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportImagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
