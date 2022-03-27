import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateToTimeService {
  public getUnixTimestampFromDate(date: Date): number {
    return Math.round(date.getTime() / 1000);
  }
}
