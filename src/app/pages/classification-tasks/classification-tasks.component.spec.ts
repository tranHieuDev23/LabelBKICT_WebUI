import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationTasksComponent } from './classification-tasks.component';

describe('DetectionTasksComponent', () => {
  let component: ClassificationTasksComponent;
  let fixture: ComponentFixture<ClassificationTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClassificationTasksComponent],
    });
    fixture = TestBed.createComponent(ClassificationTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
