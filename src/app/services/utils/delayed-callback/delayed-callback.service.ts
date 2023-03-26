import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DelayedCallbackService {
  private readonly callbackIDToCallCountMap = new Map<string, number>();

  public scheduleDelayedCallback(callbackID: string, callback: () => void, delay: number): void {
    this.increaseCallCount(callbackID);
    setTimeout(() => {
      const currentCallCount = this.decreaseCallCount(callbackID);
      if (currentCallCount === 0) {
        callback();
      }
    }, delay);
  }

  private getCallCount(callbackID: string): number {
    return this.callbackIDToCallCountMap.get(callbackID) || 0;
  }

  private increaseCallCount(callbackID: string): number {
    const currentCallCount = this.getCallCount(callbackID);
    this.callbackIDToCallCountMap.set(callbackID, currentCallCount + 1);
    return currentCallCount + 1;
  }

  private decreaseCallCount(callbackID: string): number {
    const currentCallCount = this.getCallCount(callbackID);
    this.callbackIDToCallCountMap.set(callbackID, currentCallCount - 1);
    return currentCallCount - 1;
  }
}
