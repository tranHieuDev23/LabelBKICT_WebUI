import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MassDeleteRegionModalComponent } from './mass-delete-region-modal.component';

describe('MassDeleteRegionModalComponent', () => {
  let component: MassDeleteRegionModalComponent;
  let fixture: ComponentFixture<MassDeleteRegionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MassDeleteRegionModalComponent],
    });
    fixture = TestBed.createComponent(MassDeleteRegionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
