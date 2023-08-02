import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationTaskFilterOptionsSelectorComponent } from './classification-task-filter-options-selector.component';

describe('ImageFilterOptionsSelectorComponent', () => {
  let component: ClassificationTaskFilterOptionsSelectorComponent;
  let fixture: ComponentFixture<ClassificationTaskFilterOptionsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassificationTaskFilterOptionsSelectorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationTaskFilterOptionsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
