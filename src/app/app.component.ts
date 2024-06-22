import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LineChartComponent } from './line-chart/line-chart.component';

import { StateFilterComponent } from './state-filter/state-filter.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LineChartComponent, StateFilterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'InterbizTask';
}
