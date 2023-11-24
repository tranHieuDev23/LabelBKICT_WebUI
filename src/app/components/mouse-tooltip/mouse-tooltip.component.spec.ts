import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MouseTooltipComponent } from './mouse-tooltip.component';

describe('MouseTooltipComponent', () => {
  let component: MouseTooltipComponent;
  let fixture: ComponentFixture<MouseTooltipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MouseTooltipComponent],
    });
    fixture = TestBed.createComponent(MouseTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
