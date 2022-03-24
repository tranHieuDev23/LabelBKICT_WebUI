import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ColorEvent } from 'ngx-color';

@Component({
  selector: 'app-color-box',
  templateUrl: './color-box.component.html',
  styleUrls: ['./color-box.component.scss'],
})
export class ColorBoxComponent implements OnInit {
  @Input() public color = '#fffff';
  @Output() public colorChanged = new EventEmitter<string>();

  public showPicker = false;

  constructor() {}

  ngOnInit(): void {}

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
    this.colorChanged.emit(this.color);
  }
}
