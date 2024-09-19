import { NeuralNetworkData } from '../models';

// Datos de entrenamiento sobre funciones: XOR, AND y OR
export const AND_DATA: NeuralNetworkData[] = [
  { inputs: [0, 0], targets: [0] },
  { inputs: [0, 1], targets: [0] },
  { inputs: [1, 0], targets: [0] },
  { inputs: [1, 1], targets: [1] },
];

export const OR_DATA: NeuralNetworkData[] = [
  { inputs: [0, 0], targets: [0] },
  { inputs: [0, 1], targets: [1] },
  { inputs: [1, 0], targets: [1] },
  { inputs: [1, 1], targets: [1] },
];

export const XOR_DATA: NeuralNetworkData[] = [
  { inputs: [0, 0], targets: [0] },
  { inputs: [0, 1], targets: [1] },
  { inputs: [1, 0], targets: [1] },
  { inputs: [1, 1], targets: [0] },
];

// Datos de entrenamiento sobre funciones: NAND, NOR, XNOR y NOT
export const NAND_DATA: NeuralNetworkData[] = [
  { inputs: [0, 0], targets: [1] },
  { inputs: [0, 1], targets: [1] },
  { inputs: [1, 0], targets: [1] },
  { inputs: [1, 1], targets: [0] },
];

export const NOR_DATA: NeuralNetworkData[] = [
  { inputs: [0, 0], targets: [1] },
  { inputs: [0, 1], targets: [0] },
  { inputs: [1, 0], targets: [0] },
  { inputs: [1, 1], targets: [0] },
];

export const XNOR_DATA: NeuralNetworkData[] = [
  { inputs: [0, 0], targets: [1] },
  { inputs: [0, 1], targets: [0] },
  { inputs: [1, 0], targets: [0] },
  { inputs: [1, 1], targets: [1] },
];

export const NOT_DATA: NeuralNetworkData[] = [
  { inputs: [0], targets: [1] },
  { inputs: [1], targets: [0] },
];
