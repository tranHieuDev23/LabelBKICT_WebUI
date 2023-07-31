import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageFilterOptionsSelectorComponent } from './image-filter-options-selector.component';

describe('ImageFilterOptionsSelectorComponent', () => {
  let component: ImageFilterOptionsSelectorComponent;
  let fixture: ComponentFixture<ImageFilterOptionsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageFilterOptionsSelectorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageFilterOptionsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
