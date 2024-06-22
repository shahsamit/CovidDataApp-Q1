import { Component, Input, OnChanges, SimpleChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnChanges, OnInit {
  @Input() selectedState: string = '';
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  data: any;
  options: any;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Load Chart.js plugins that rely on window only in browser environment
      import('chartjs-plugin-zoom').then((zoomPlugin) => {
        Chart.register(zoomPlugin.default);
        this.fetchData(); // Call fetchData after plugin is imported
      }).catch(error => {
        console.error('Error importing chartjs-plugin-zoom:', error);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedState'] || changes['startDate'] || changes['endDate']) {
      this.fetchData();
    }
  }

  fetchData() {
    if (!this.selectedState || !this.startDate || !this.endDate) {
      return;
    }

    const state = this.selectedState.toLowerCase();
    const apiUrl = `https://api.covidtracking.com/v1/states/${state}/daily.json`;

    this.http.get<any[]>(apiUrl).subscribe(
      (data: any[]) => {
        const filteredData = data.filter(item => item.date >= this.startDate && item.date <= this.endDate);
        const dates = filteredData.map(item => {
          // Assuming item.date is in YYYYMMDD format, convert it to YYYY-MM-DD
          const dateString = item.date.toString();
          const formattedDate = `${dateString.substr(4, 2)}-${dateString.substr(6, 2)}-${dateString.substr(0, 4)}`;
          return formattedDate;
        }).reverse(); // Reversing Data as we need it in ascending order.
        const dailyRise = filteredData.map(item => item.positiveIncrease).reverse(); // Data received from API is in Descending order

        this.data = {
          labels: dates,
          datasets: [
            {
              label: 'Daily Rise / Fall',
              type: 'line',
              data: dailyRise,
              fill: true,
              backgroundColor: "rgb(216,230,253,0.5)",
              borderColor: '#42A5F5',
              borderWidth: 1,
              tension: 0.5
            }
          ]
        };

        this.options = {
          maintainAspectRatio: false,
          aspectRatio: 0.6,
          plugins: {
            legend: {
              labels: {
                color: '#495057'
              }
            },
            zoom: {
              pan: {
                enabled: true,
                mode: 'x', // Enable vertical pan only
              },
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true
                },
                mode: 'x', // Enable vertical zoom only
              }
            }
          },
          scales: {
            x: {
              position: 'bottom',
              title: {
                display: true,
                text: "Date",
                color: '#000',
                font: {
                  size: 17
                }
              },
              ticks: {
                color: '#6c757d',
                font: {
                  size: 14
                }
              },
              grid: {
                color: '#dee2e6',
                drawBorder: false
              }
            },
            y: {
              position: 'bottom',
              title: {
                display: true,
                text: "Number of Cases",
                color: '#000',
                font: {
                  size: 17
                }
              },
              ticks: {
                color: '#6c757d',
                font: {
                  size: 14
                }
              },
              grid: {
                color: '#dee2e6',
                drawBorder: false
              }
            }
          }
        };
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
  }
}
