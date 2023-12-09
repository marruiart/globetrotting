import { Directive, ElementRef, Input, Renderer2, RendererFactory2 } from '@angular/core';

@Directive({
  selector: '[themeColors]'
})
export class ThemeColorsDirective {
  private renderer: Renderer2;
  private _themeColors: string = 'lara-light-blue';

  @Input() set themeColors(theme: string) {
    if (theme) {
      if (theme.includes("dark")) {
        this.renderer.addClass(this.element.nativeElement, 'dark');
      } else {
        this.renderer.addClass(this.element.nativeElement, 'light');
      }
      this.renderer.addClass(this.element.nativeElement, theme);
    }
  }
  get themeColors() {
    return this._themeColors;
  }

  constructor(
    private element: ElementRef,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

}
