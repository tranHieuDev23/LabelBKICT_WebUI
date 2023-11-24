import { Component, HostListener, Input, TemplateRef, ViewChild } from '@angular/core';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-mouse-tooltip',
  templateUrl: './mouse-tooltip.component.html',
  styleUrls: ['./mouse-tooltip.component.scss'],
})
export class MouseTooltipComponent {
  @ViewChild(NzTooltipDirective, { static: true }) tooltip: NzTooltipDirective | undefined;

  @Input() title: string | TemplateRef<void> = '';

  public get visible(): boolean {
    return this.tooltip?.visible || false;
  }

  @HostListener('window: touchmove', ['$event'])
  @HostListener('window: mousemove', ['$event'])
  public handleMouseMove(event: MouseEvent | TouchEvent): void {
    if (!this.tooltip) {
      return;
    }
    const tooltipRootElement: HTMLElement = this.tooltip.elementRef.nativeElement;
    const mousePos = this.getMousePositionFromMouseEvent(event);
    tooltipRootElement.style.top = `${mousePos.y}px`;
    tooltipRootElement.style.left = `${mousePos.x}px`;
    this.tooltip?.updatePosition();
  }

  public show(): void {
    if (!this.tooltip) {
      return;
    }
    this.tooltip.show();
    this.tooltip.visible = true;
  }

  public hide(): void {
    if (!this.tooltip) {
      return;
    }
    this.tooltip.hide();
    this.tooltip.visible = false;
  }

  private getMousePositionFromMouseEvent(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    }
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
}
