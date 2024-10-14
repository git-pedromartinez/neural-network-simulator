import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';
import { NeuralNetworkVisualizerComponent } from '../components/neural-network-visualizer/neural-network-visualizer.component';

@Directive({
  selector: '[appZoomableCanvas]',
  standalone: true,
})
export class ZoomableCanvasDirective implements OnInit {
  private scale: number = 1;
  private scaleFactor: number = 0.1;
  private posX: number = 0;
  private posY: number = 0;
  private drag: boolean = false;
  private startX: number = 0;
  private startY: number = 0;

  constructor(
    private el: ElementRef<HTMLCanvasElement>,
    private readonly component: NeuralNetworkVisualizerComponent
  ) {}

  ngOnInit(): void {
    this.initializeCanvas();
    this.component.updateVisualization();
  }

  private initializeCanvas(): void {
    const canvas = this.el.nativeElement;
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.border = '1px solid #ccc';
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.drag = true;
    this.startX = event.offsetX - this.posX;
    this.startY = event.offsetY - this.posY;
    this.el.nativeElement.style.cursor = 'grabbing';
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    this.drag = false;
    this.el.nativeElement.style.cursor = 'grab';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.drag) {
      this.posX = event.offsetX - this.startX;
      this.posY = event.offsetY - this.startY;
      this.component.updateVisualization();
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault();

    const canvas = this.el.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomFactor = event.deltaY > 0 ? -this.scaleFactor : this.scaleFactor;
    const newScale = this.scale + zoomFactor;

    if (newScale >= 0.1) {
      const scaleRatio = newScale / this.scale;

      this.posX = mouseX - (mouseX - this.posX) * scaleRatio;
      this.posY = mouseY - (mouseY - this.posY) * scaleRatio;

      this.scale = newScale;
      this.component.updateVisualization();
    }
  }

  zoomIn(): void {
    this.scale += this.scaleFactor;
    this.component.updateVisualization();
  }

  zoomOut(): void {
    this.scale = Math.max(this.scale - this.scaleFactor, 0.1);
    this.component.updateVisualization();
  }

  reset(): void {
    this.scale = 1;
    this.posX = 0;
    this.posY = 0;
    this.component.updateVisualization();
  }

  getZoomLevel(): number {
    return this.scale;
  }

  getOffsetX(): number {
    return this.posX;
  }

  getOffsetY(): number {
    return this.posY;
  }
}
