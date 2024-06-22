import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { MatSnackBar } from '@angular/material/snack-bar';

interface State {
  value: string;
  label: string;
}

@Component({
  selector: 'app-state-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule,LineChartComponent],
  providers: [DatePipe],
  templateUrl: './state-filter.component.html',
  styleUrls: ['./state-filter.component.css']
})
export class StateFilterComponent {
  selectedState: string = 'AZ'; // Variable to hold selected state value
  startDate: string = '20200307';
  endDate: string = '20210307'; 
  minEndDate: string = '20200302';// Variable to hold the end date
  states: State[] = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];
  dailyCases: number = 0;
  positiveCases: number = 0;
  percentChange: number = 0;
  recovered: number = 0;

  constructor(
    private http: HttpClient, 
    private datePipe: DatePipe, 
    private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.fetchData();
  }

  onStateChange() {
    this.fetchData();
  }

  onDateChange(event: any, type: 'start' | 'end'): void {
    if (type === 'start') {
      // Update minimum end date based on the selected start date
      let newStartDate = new Date(this.startDate);
      let minEndDate = new Date(newStartDate);
      minEndDate.setDate(newStartDate.getDate() + 1); // Set minimum end date to start date + 1 day

      // Format minEndDate as YYYY-MM-DD
      this.minEndDate = minEndDate.toISOString().split('T')[0];

      // Ensure endDate is always greater than or equal to minEndDate
      let newEndDate = new Date(this.endDate);
      if (newEndDate < minEndDate) {
        newEndDate = new Date(minEndDate);
        this.endDate = newEndDate.toISOString().split('T')[0]; // Update endDate to meet the new minEndDate
      }
    }

    this.fetchData(); // Fetch data with updated dates
  }




  formatDateForApi(date: string): string {
    return date.replace(/-/g, '');
  }
  
  updateCardValues(data: any[]) {
    if (data.length > 0) {
      this.dailyCases = data[0].total || 0;
      const percentChange = (((data[1].total - data[0].total) / data[1].total) * 100).toFixed(2);
      this.percentChange = parseFloat(percentChange);
      this.recovered = data[0].recovered || 0;
    } else {
      this.dailyCases = 0;
      this.percentChange = 0;
      this.recovered = 0;
    }
  }


  fetchData() {
    const state = this.selectedState.toLowerCase();
    const formattedStartDate = this.formatDateForApi(this.startDate);
    const formattedEndDate = this.formatDateForApi(this.endDate);
    const apiUrl = `https://api.covidtracking.com/v1/states/${state}/daily.json`;

    this.http.get<any[]>(apiUrl).subscribe(
      (data: any[]) => {
        const filteredData = data.filter(item => item.date >= formattedStartDate && item.date <= formattedEndDate);
        this.updateCardValues(filteredData);
        if (filteredData.length > 0) {
          // this.dailyCases = filteredData[1].positiveIncrease - filteredData[0].positiveIncrease;
          this.dailyCases = filteredData[0].positiveIncrease;
          // const percentChange = (((filteredData[0].positive - filteredData[1].positive) / filteredData[1].positive) * 100).toFixed(2);
          const percentChange = ((filteredData[0].positiveIncrease / filteredData[0].positive) * 100).toFixed(2); 
          this.percentChange = parseFloat(percentChange);
          this.recovered = filteredData[0].recovered || 0;
        } else {
          this.dailyCases = 0;
        }
      },
      (error) => {
        console.error('API Error:', error);
        this.dailyCases = 0;
      }
    );

    const positiveCasesUrl = `https://api.covidtracking.com/v1/states/${state}/current.json`;
    this.http.get<any>(positiveCasesUrl).subscribe(
      (data) => {
        this.positiveCases = data.positive || 0;
      },
      (error) => {
        console.error('Positive Cases API Error:', error);
        this.positiveCases = 0;
      }
    );
  }
}