import { Injectable } from '@angular/core';
import randomcolor from 'randomcolor';

@Injectable({
  providedIn: 'root',
})
export class RandomColorService {
  constructor() {}

  public getRandomColor(): string {
    return randomcolor().toUpperCase();
  }
}
