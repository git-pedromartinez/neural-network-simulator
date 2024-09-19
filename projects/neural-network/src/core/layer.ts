import { Neuron } from "./neuron";
import { ActivationFunction, ActivationFunctionDerivative } from "../models";

export class Layer {
  neurons: Neuron[];

  constructor(
    numNeurons: number,
    inputSize: number,
    activationFunction: ActivationFunction,
    activationDerivative: ActivationFunctionDerivative
  ) {
    this.neurons = Array.from(
      { length: numNeurons },
      () => new Neuron(inputSize, activationFunction, activationDerivative)
    );
  }

  forward(inputs: number[]): number[] {
    return this.neurons.map((neuron) => neuron.activate(inputs));
  }
}
