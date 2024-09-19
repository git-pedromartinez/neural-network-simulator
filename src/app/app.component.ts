import { Component } from '@angular/core';
import { NeuralNetworkVisualizerComponent } from './components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NeuralNetworkVisualizerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'neural-network-simulator';
}
