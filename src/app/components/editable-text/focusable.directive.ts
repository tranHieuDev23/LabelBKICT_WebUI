import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appFocusable]',
})
export class FocusableDirective {
  constructor(private el: ElementRef) {
    if (!el.nativeElement.focus) {
      throw new Error('Element does not support focus.');
    }
  }

  public focus(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    input.focus();
    input.select();
  }
}
