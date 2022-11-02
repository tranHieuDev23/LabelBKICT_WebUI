import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorEvent } from 'ngx-color';

@Component({
  selector: 'app-color-box',
  templateUrl: './color-box.component.html',
  styleUrls: ['./color-box.component.scss'],
})
export class ColorBoxComponent {
  @Input() public color = '#FFFFFF';
  @Output() public colorChanged = new EventEmitter<string>();

  public showPicker = false;

  constructor() {}

  public togglePicker(): void {
    this.showPicker = !this.showPicker;
  }

  public onColorChanged(event: ColorEvent): void {
    this.color = event.color.hex;
    if (event.$event instanceof MouseEvent) {
      this.onSubmitColorInput();
    }
  }

  public onSubmitColorInput(): void {
    this.colorChanged.emit(this.color.toUpperCase());
  }
}
