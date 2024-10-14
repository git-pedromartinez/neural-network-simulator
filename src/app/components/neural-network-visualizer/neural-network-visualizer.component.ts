import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import XOR_TRAINING_history from './XOR_TRAINING_history.json';
import { ZoomableCanvasDirective } from '../../directives/appZoomableCanvas';

interface NeuronData {}
interface NeuronPoint {
  x: number;
  y: number;
}
interface ConnectionData {}

export const DELAY_TIME = 0;
export const LAYERS = [2, 3, 10, 15, 10, 5, 3, 1];
export const RADIUS = 10; // Reducir el tamaño de los nodos
export const NEURON_SPACING = RADIUS;
export const CONNECTION_SPACING = RADIUS * 4;

@Component({
  selector: 'app-neural-network-visualizer',
  standalone: true,
  imports: [FormsModule, ZoomableCanvasDirective],
  providers: [],
  templateUrl: './neural-network-visualizer.component.html',
  styleUrls: ['./neural-network-visualizer.component.scss'],
})
export class NeuralNetworkVisualizerComponent implements OnInit {
  @ViewChild('neuralCanvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  public timeDelay = DELAY_TIME;
  public selectedEpoch = 0;
  public selectedInput = 0;
  public maxEpoch = 0;
  public maxInput = 0;
  public inputs = '';
  public outputs = '';

  private neurons: { point: NeuronPoint; data: NeuronData }[] = [];
  private connections: {
    pA: NeuronPoint;
    pB: NeuronPoint;
    data: ConnectionData;
  }[] = [];
  private data: any;

  @ViewChild(ZoomableCanvasDirective) canvasZoom!: ZoomableCanvasDirective;

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.loadTrainingData();
  }

  async loadTrainingData() {
    this.data = XOR_TRAINING_history;
    this.initializeControls();
  }

  initializeControls() {
    this.maxEpoch = this.data.epochs.length - 1;
    this.maxInput = this.data.epochs[0].length - 1;
    this.updateVisualization();
  }

  onEpochChange() {
    this.selectedInput = 0;
    this.maxInput = this.data.epochs[this.selectedEpoch].length - 1;
    this.updateVisualization();
  }

  onInputChange() {
    this.updateVisualization();
  }

  updateVisualization() {
    const epoch = this.selectedEpoch;
    const inputIndex = this.selectedInput;
    const inputData = this.data.epochs[epoch][inputIndex];
    const sizes = this.data.metaData.sizes.slice(1);

    this.inputs = inputData.input.join(', ');
    this.outputs = inputData.data.outputs.join(', ');

    this.clearNeuralNetwork();
    this.drawNeuralNetworkFromData(inputData, sizes);
  }

  drawNeuralNetworkFromData(inputData: any, sizes: number[]) {
    const layerSpacing = this.canvas.nativeElement.width / (sizes.length + 1);
    const zoomLevel = this.canvasZoom?.getZoomLevel() || 1;
    const offsetX = this.canvasZoom?.getOffsetX() || 0;
    const offsetY = this.canvasZoom?.getOffsetY() || 0;

    sizes.forEach((neurons, layerIndex) => {
      const neuronSpacing = this.canvas.nativeElement.height / (neurons + 1);

      for (let neuronIndex = 0; neuronIndex < neurons; neuronIndex++) {
        const x = (layerIndex + 1) * layerSpacing;
        const y = (neuronIndex + 1) * neuronSpacing;
        this.drawNeuron(x, y, {}, zoomLevel, offsetX, offsetY);

        if (
          inputData.data.biases[layerIndex] &&
          inputData.data.biases[layerIndex][neuronIndex] !== undefined
        ) {
          this.drawText(
            x,
            y - 10,
            `B: ${inputData.data.biases[layerIndex][neuronIndex].toFixed(2)}`,
            zoomLevel,
            offsetX,
            offsetY
          );
        }

        if (
          inputData.data.weights[layerIndex] &&
          inputData.data.weights[layerIndex][neuronIndex] !== undefined
        ) {
          this.drawText(
            x,
            y + 10,
            `W: ${inputData.data.weights[layerIndex][neuronIndex]
              .map((w: number) => w.toFixed(2))
              .join(', ')}`,
            zoomLevel,
            offsetX,
            offsetY
          );
        }
      }
    });

    for (let i = 0; i < sizes.length - 1; i++) {
      const currentLayerNeurons = sizes[i];
      const nextLayerNeurons = sizes[i + 1];

      for (let j = 0; j < currentLayerNeurons; j++) {
        for (let k = 0; k < nextLayerNeurons; k++) {
          const x1 = (i + 1) * layerSpacing;
          const y1 =
            (j + 1) *
            (this.canvas.nativeElement.height / (currentLayerNeurons + 1));
          const x2 = (i + 2) * layerSpacing;
          const y2 =
            (k + 1) *
            (this.canvas.nativeElement.height / (nextLayerNeurons + 1));
          this.drawConnection(
            { x: x1, y: y1 },
            { x: x2, y: y2 },
            {},
            zoomLevel,
            offsetX,
            offsetY
          );
        }
      }
    }
  }

  drawNeuron(
    x: number,
    y: number,
    data: NeuronData = {},
    zoomLevel: number,
    offsetX: number,
    offsetY: number
  ) {
    const radius = 10 * zoomLevel; // Reducir el tamaño de los nodos
    this.ctx.beginPath();
    this.ctx.arc(
      x * zoomLevel + offsetX,
      y * zoomLevel + offsetY,
      radius,
      0,
      Math.PI * 2
    );
    this.ctx.fillStyle = 'lightblue'; // Cambiar el color de los nodos
    this.ctx.fill();
    this.ctx.strokeStyle = 'darkblue'; // Cambiar el color del borde de los nodos
    this.ctx.stroke();

    this.neurons.push({ point: { x, y }, data });
  }

  drawConnection(
    pA: NeuronPoint,
    pB: NeuronPoint,
    data: ConnectionData = {},
    zoomLevel: number,
    offsetX: number,
    offsetY: number
  ) {
    this.ctx.beginPath();
    this.ctx.moveTo(pA.x * zoomLevel + offsetX, pA.y * zoomLevel + offsetY);
    this.ctx.lineTo(pB.x * zoomLevel + offsetX, pB.y * zoomLevel + offsetY);
    this.ctx.strokeStyle = 'gray'; // Cambiar el color de las conexiones
    this.ctx.stroke();

    this.connections.push({ pA, pB, data });
  }

  drawText(
    x: number,
    y: number,
    text: string,
    zoomLevel: number,
    offsetX: number,
    offsetY: number
  ) {
    this.ctx.fillStyle = 'black';
    this.ctx.font = `${10 * zoomLevel}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x * zoomLevel + offsetX, y * zoomLevel + offsetY);
  }

  clearNeuralNetwork(): void {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  zoomIn(): void {
    this.canvasZoom.zoomIn();
  }

  zoomOut(): void {
    this.canvasZoom.zoomOut();
  }

  reset(): void {
    this.canvasZoom.reset();
  }
}
