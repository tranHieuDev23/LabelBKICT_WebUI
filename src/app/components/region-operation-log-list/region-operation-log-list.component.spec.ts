import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionOperationLogListComponent } from './region-operation-log-list.component';

describe('RegionOperationLogListComponent', () => {
  let component: RegionOperationLogListComponent;
  let fixture: ComponentFixture<RegionOperationLogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegionOperationLogListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionOperationLogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
