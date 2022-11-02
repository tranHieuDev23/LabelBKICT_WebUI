import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageImageTagsComponent } from './manage-image-tags.component';

describe('ManageImageTagsComponent', () => {
  let component: ManageImageTagsComponent;
  let fixture: ComponentFixture<ManageImageTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageImageTagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageImageTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
