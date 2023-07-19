import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectionTaskFilterOptionsSelectorComponent } from './detection-task-filter-options-selector.component';

describe('ImageFilterOptionsSelectorComponent', () => {
  let component: DetectionTaskFilterOptionsSelectorComponent;
  let fixture: ComponentFixture<DetectionTaskFilterOptionsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetectionTaskFilterOptionsSelectorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectionTaskFilterOptionsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
