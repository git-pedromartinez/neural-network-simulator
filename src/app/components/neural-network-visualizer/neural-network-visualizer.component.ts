import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import {
  NeuralNetwork,
  NeuralNetworkData,
  TestingNetworkData,
} from 'neural-network';

interface NeuronData {
  // Define the properties for NeuronData here
}

interface NeuronPoint {
  x: number;
  y: number;
}

interface ConnectionData {
  // Define the properties for ConnectionData here
}

@Component({
  selector: 'app-neural-network-visualizer',
  standalone: true,
  imports: [FormsModule],
  providers: [NgModel],
  templateUrl: './neural-network-visualizer.component.html',
  styleUrl: './neural-network-visualizer.component.scss',
})
export class NeuralNetworkVisualizerComponent implements OnInit {
  @ViewChild('neuralCanvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  public timeDelay = 100;

  private neurons: { point: NeuronPoint; data: NeuronData }[] = [];
  private connections: {
    pA: NeuronPoint;
    pB: NeuronPoint;
    data: ConnectionData;
  }[] = [];

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.play(this.timeDelay);

    this.canvas.nativeElement.addEventListener(
      'click',
      this.handleCanvasClick.bind(this)
    );
  }

  clearNeuralNetwork(): void {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Limpia todo el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  async drawNeuralNetwork(ms: number = 0, flow: 'left' | 'right' = 'left') {
    const neuronsPerLayer = [3, 4, 2]; // Ejemplo: 3 neuronas en la entrada, 4 en la capa oculta, 2 en la salida
    const layerSpacing =
      this.canvas.nativeElement.width / (neuronsPerLayer.length + 1);

    // Arreglo para almacenar las coordenadas de las neuronas de cada capa
    const neuronsCoordinates: { x: number; y: number }[][] = [];

    // Determinamos el orden de las capas para el renderizado de las neuronas
    const layerIndices =
      flow === 'left'
        ? [...Array(neuronsPerLayer.length).keys()] // [0, 1, 2] para 'left'
        : [...Array(neuronsPerLayer.length).keys()].reverse(); // [2, 1, 0] para 'right'

    // Primero dibujamos todas las neuronas en el orden determinado por `flow`
    for (const layerIndex of layerIndices) {
      const neurons = neuronsPerLayer[layerIndex];
      const x = (layerIndex + 1) * layerSpacing;
      const neuronSpacing = this.canvas.nativeElement.height / (neurons + 1);
      const currentLayerCoords: { x: number; y: number }[] = [];

      // Dibuja las neuronas de la capa actual y almacena sus coordenadas
      for (let i = 0; i < neurons; i++) {
        const y = (i + 1) * neuronSpacing;
        this.drawNeuron(x, y, {});
        currentLayerCoords.push({ x, y });
        if (ms) await delay(ms);
      }

      neuronsCoordinates[layerIndex] = currentLayerCoords;
    }

    // Ajustamos el orden de renderizado de las conexiones basado en `flow`
    const startLayer = flow === 'left' ? 1 : neuronsCoordinates.length - 1;
    const endLayer = flow === 'left' ? neuronsCoordinates.length : -1;
    const step = flow === 'left' ? 1 : -1;

    // Dibujamos conexiones de acuerdo al flujo especificado
    for (
      let layerIndex = startLayer;
      layerIndex !== endLayer;
      layerIndex += step
    ) {
      const currentLayer = neuronsCoordinates[layerIndex];
      const previousLayerIndex = layerIndex - step;

      // Verifica que el previousLayerIndex esté dentro de los límites del array
      if (
        previousLayerIndex >= 0 &&
        previousLayerIndex < neuronsCoordinates.length
      ) {
        const previousLayer = neuronsCoordinates[previousLayerIndex];

        // Asegúrate de que previousLayer está definido y es iterable
        if (previousLayer && Array.isArray(previousLayer)) {
          // Dibuja conexiones entre la capa actual y la anterior
          for (let { x, y } of currentLayer) {
            for (let { x: prevX, y: prevY } of previousLayer) {
              this.drawConnection({ x, y }, { x: prevX, y: prevY }, {});
              if (ms) await delay(ms);
            }
          }
        }
      }
    }
  }

  drawNeuron(x: number, y: number, data: NeuronData = {}) {
    const radius = 20;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = 'blue';
    this.ctx.fill();
    this.ctx.stroke();

    // Store neuron data
    this.neurons.push({ point: { x, y }, data });
  }

  drawConnection(pA: NeuronPoint, pB: NeuronPoint, data: ConnectionData = {}) {
    this.ctx.beginPath();
    this.ctx.moveTo(pA.x, pA.y);
    this.ctx.lineTo(pB.x, pB.y);
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();

    // Store connection data
    this.connections.push({ pA, pB, data });
  }

  handleCanvasClick(event: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if a neuron was clicked
    for (const neuron of this.neurons) {
      const { x, y } = neuron.point;
      const radius = 20;
      if (Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2) < radius) {
        console.log('Neuron clicked:', neuron.data);
        return;
      }
    }

    // Check if a connection was clicked
    for (const connection of this.connections) {
      const { pA, pB } = connection;
      const distanceToLine = this.pointToLineDistance(mouseX, mouseY, pA, pB);
      if (distanceToLine < 5) {
        // Umbral de 5 píxeles para detectar clics en la línea
        console.log('Connection clicked:', connection.data);
        return;
      }
    }
  }

  pointToLineDistance(
    x: number,
    y: number,
    pA: NeuronPoint,
    pB: NeuronPoint
  ): number {
    const A = x - pA.x;
    const B = y - pA.y;
    const C = pB.x - pA.x;
    const D = pB.y - pA.y;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;

    if (param < 0) {
      xx = pA.x;
      yy = pA.y;
    } else if (param > 1) {
      xx = pB.x;
      yy = pB.y;
    } else {
      xx = pA.x + param * C;
      yy = pA.y + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  play(ms: number = 0, flow: 'left' | 'right' = 'left'): void {
    this.clearNeuralNetwork();
    this.drawNeuralNetwork(ms ?? DELAY_TIME, flow);
  }

  playNeuralNetwork(): void {
    // Datos de entrenamiento sobre funciones: XOR, AND y OR
    const AND_DATA: NeuralNetworkData[] = [
      { inputs: [0, 0], targets: [0] },
      { inputs: [0, 1], targets: [0] },
      { inputs: [1, 0], targets: [0] },
      { inputs: [1, 1], targets: [1] },
    ];

    const OR_DATA: NeuralNetworkData[] = [
      { inputs: [0, 0], targets: [0] },
      { inputs: [0, 1], targets: [1] },
      { inputs: [1, 0], targets: [1] },
      { inputs: [1, 1], targets: [1] },
    ];

    const XOR_DATA: NeuralNetworkData[] = [
      { inputs: [0, 0], targets: [0] },
      { inputs: [0, 1], targets: [1] },
      { inputs: [1, 0], targets: [1] },
      { inputs: [1, 1], targets: [0] },
    ];

    // Configuración de la red neuronal con función de activación sigmoide (por defecto)
    const neuralNetwork: NeuralNetwork = new NeuralNetwork(
      [2, 30, 1],
      0.1,
      10000
    );

    // Función para probar la red neuronal con los conjuntos de datos
    function testNetwork(
      network: NeuralNetwork,
      testingNetworkData: TestingNetworkData[]
    ): void {
      testingNetworkData.forEach((data) => {
        const output: number[] = network.predict(data.inputs);
        console.log(
          `Inputs: ${data.inputs} => Output: ${output.map((o) => o.toFixed(2))}`
        );
      });
    }

    // Entrenamiento y guardado para cada función lógica
    neuralNetwork.train(AND_DATA, 'AND_TRAINING');
    neuralNetwork.train(OR_DATA, 'OR_TRAINING');
    neuralNetwork.train(XOR_DATA, 'XOR_TRAINING');

    // Cargar un entrenamiento específico y probar una entrada
    console.log('\nPrueba de red cargando el entrenamiento AND_TRAINING:');
    if (neuralNetwork.loadTraining('AND_TRAINING')) {
      testNetwork(neuralNetwork, AND_DATA);
    }

    console.log('\nPrueba de red cargando el entrenamiento OR_TRAINING:');
    if (neuralNetwork.loadTraining('OR_TRAINING')) {
      testNetwork(neuralNetwork, OR_DATA);
    }

    console.log('\nPrueba de red cargando el entrenamiento XOR_TRAINING:');
    if (neuralNetwork.loadTraining('XOR_TRAINING')) {
      testNetwork(neuralNetwork, XOR_DATA);
    }
  }
}

export const DELAY_TIME = 250;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
