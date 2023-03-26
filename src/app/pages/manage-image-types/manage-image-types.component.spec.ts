import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageImageTypesComponent } from './manage-image-types.component';

describe('ManageImageTypesComponent', () => {
  let component: ManageImageTypesComponent;
  let fixture: ComponentFixture<ManageImageTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageImageTypesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageImageTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
