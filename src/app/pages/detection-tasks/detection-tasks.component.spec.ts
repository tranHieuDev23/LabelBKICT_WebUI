import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectionTasksComponent } from './detection-tasks.component';

describe('DetectionTasksComponent', () => {
  let component: DetectionTasksComponent;
  let fixture: ComponentFixture<DetectionTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetectionTasksComponent],
    });
    fixture = TestBed.createComponent(DetectionTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
