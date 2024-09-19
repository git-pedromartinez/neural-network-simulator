import { Layer } from "./layer";
import { ActivationFunctions } from "./activation-functions";
import {
  ActivationFunction,
  ActivationFunctionDerivative,
  Matrix,
  NeuralNetworkData,
  TrainingNetworkData,
} from "../models";

export class NeuralNetwork {
  private layers: Layer[];
  private learningRate: number;
  private epochs: number;
  private trainingHistory: { [key: string]: TrainingNetworkData } = {};

  constructor(
    sizes: number[],
    learningRate: number,
    epochs: number,
    activationFunction: ActivationFunction = ActivationFunctions.sigmoid,
    activationDerivative: ActivationFunctionDerivative = ActivationFunctions.sigmoidDerivative
  ) {
    this.layers = [];
    for (let i = 1; i < sizes.length; i++) {
      this.layers.push(
        new Layer(
          sizes[i],
          sizes[i - 1],
          activationFunction,
          activationDerivative
        )
      );
    }
    this.learningRate = learningRate;
    this.epochs = epochs;
  }

  train(TrainingNetworkData: NeuralNetworkData[], trainingName: string): void {
    const inputs: Matrix<'2D'> = TrainingNetworkData.map((d) => d.inputs);
    const targets: Matrix<'2D'> = TrainingNetworkData.map((d) => d.targets);

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      inputs.forEach((input, index) => {
        this.backward(input, targets[index]);
      });
    }
    this.saveTraining(trainingName);
  }

  private backward(inputs: number[], targets: number[]): void {
    const outputs: Matrix<'2D'> = this.forward(inputs);
    const outputErrors: number[] = targets.map(
      (t, i) => t - outputs[outputs.length - 1][i]
    );
    const errors: Matrix<'2D'> = this.calculateErrors(outputErrors);

    for (let i = this.layers.length - 1; i >= 0; i--) {
      this.adjustWeights(this.layers[i], outputs[i], outputs[i + 1], errors[i]);
    }
  }

  private forward(inputs: number[]): Matrix<'2D'> {
    const outputs: Matrix<'2D'> = [inputs];
    for (const layer of this.layers) {
      outputs.push(layer.forward(outputs[outputs.length - 1]));
    }
    return outputs;
  }

  private adjustWeights(
    layer: Layer,
    inputs: number[],
    outputs: number[],
    errors: number[]
  ): void {
    layer.neurons.forEach((neuron, i) => {
      const gradient: number =
        errors[i] * neuron.activationDerivative(outputs[i]) * this.learningRate;
      neuron.bias += gradient;
      neuron.weights = neuron.weights.map(
        (weight, j) => weight + inputs[j] * gradient
      );
    });
  }

  private calculateErrors(outputErrors: number[]): Matrix<'2D'> {
    const errors: Matrix<'2D'> = [outputErrors];
    for (let i = this.layers.length - 1; i > 0; i--) {
      const layer: Layer = this.layers[i];
      const previousLayer: Layer = this.layers[i - 1];
      const hiddenErrors: number[] = previousLayer.neurons.map((neuron, j) =>
        errors[0].reduce(
          (sum, error, k) => sum + error * layer.neurons[k].weights[j],
          0
        )
      );
      errors.unshift(hiddenErrors);
    }
    return errors;
  }

  predict(inputs: number[]): number[] {
    return this.forward(inputs)[this.layers.length];
  }

  private saveTraining(name: string): void {
    this.trainingHistory[name] = {
      weights: this.layers.map((layer) =>
        layer.neurons.map((neuron) => [...neuron.weights])
      ),
      biases: this.layers.map((layer) =>
        layer.neurons.map((neuron) => neuron.bias)
      ),
    };
    console.log(`Entrenamiento guardado como: ${name}`);
  }

  public loadTraining(name: string): boolean {
    const TrainingNetworkData: TrainingNetworkData | undefined = this.trainingHistory[name];
    if (!TrainingNetworkData) {
      console.log(`Entrenamiento "${name}" no encontrado.`);
      return false;
    }

    this.layers.forEach((layer, i) => {
      layer.neurons.forEach((neuron, j) => {
        neuron.weights = [...TrainingNetworkData.weights[i][j]];
        neuron.bias = TrainingNetworkData.biases[i][j];
      });
    });

    console.log(`Entrenamiento "${name}" cargado correctamente.`);
    return true;
  }
}
