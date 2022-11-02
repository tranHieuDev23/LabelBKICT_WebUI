import { Pipe, PipeTransform } from '@angular/core';
import { PlatformService } from 'src/app/services/utils/platform/platform.service';

@Pipe({
  name: 'emptyStringOnMobile',
  pure: false,
})
export class EmptyStringOnMobilePipe implements PipeTransform {
  private viewportWidth = 0;

  constructor(private readonly platformService: PlatformService) {
    if (!platformService.isBrowser()) {
      return;
    }
    this.viewportWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      this.viewportWidth = window.innerWidth;
    });
  }

  transform(text: string): string {
    if (this.platformService.isBrowser()) {
      return this.viewportWidth < 768 ? '' : text;
    }
    return '';
  }
}
