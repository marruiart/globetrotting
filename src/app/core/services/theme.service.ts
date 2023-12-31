import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private themeLink: HTMLLinkElement;

  constructor(
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    const linkElement = document.getElementById('app-theme') as HTMLLinkElement;
    if (linkElement) {
      this.themeLink = linkElement;
    } else {
      this.themeLink = this.renderer.createElement('link');
      this.themeLink.id = 'app-theme';
      this.themeLink.rel = 'stylesheet';
      this.themeLink.type = 'text/css';
      this.renderer.appendChild(document.head, this.themeLink);
    }
  }

  switchTheme(theme: string) {
    this.themeLink.href = `${theme}.css`;
  }

}
