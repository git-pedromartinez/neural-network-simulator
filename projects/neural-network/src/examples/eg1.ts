import { NeuralNetwork } from '../core';
import { TestingNetworkData } from '../models';
import { AND_DATA, OR_DATA, XOR_DATA } from './eg1.data';

// Configuración de la red neuronal con función de activación sigmoide (por defecto)
const neuralNetwork: NeuralNetwork = new NeuralNetwork([2, 30, 1], 0.1, 10000);

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
