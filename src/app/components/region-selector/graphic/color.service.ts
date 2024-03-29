import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  public getTransparentVersionOfColor(color: string) {
    return `${color}4c`;
  }
}
