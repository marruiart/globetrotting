import { Component, ElementRef, Renderer2, RendererFactory2, ViewChild } from '@angular/core';
import { MenuService } from 'src/app/core/services/menu.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @ViewChild('svgElement') svgElement: ElementRef | null = null;
  private renderer: Renderer2;

  constructor(
    public menuSvc: MenuService,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  ngOnInit() {
    if (this.svgElement) {
      this.svgElement.nativeElement.onload = () => {
        const svgDoc = this.svgElement?.nativeElement.contentDocument;
        if (svgDoc) {
          const pathElement = svgDoc.element('#svg-logo');
          if (pathElement instanceof SVGElement) {
            this.renderer.setAttribute(pathElement, 'fill', '#ffffff');
          }
        }
      };
    }
  }

}
