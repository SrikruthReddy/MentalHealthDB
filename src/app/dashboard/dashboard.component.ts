import { Component, OnInit } from '@angular/core';
import { DbConnectService } from '../db-connect.service';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  OperatorFunction,
} from 'rxjs';

interface rowData {
  name: string;
}

interface dbData {
  metaData: rowData[];
  rows: any[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  selectedYear: string = 'Year';
  selectedYear2: string = 'Year2';
  selectedMonth: string = 'Month';
  selectedCity: string = 'City';
  isYearVisible: boolean = false;
  isYear2Visible: boolean = false;
  isCityVisible: boolean = false;
  isMonthVisible: boolean = false;
  selectedQuery: string = 'Choose a table';
  months: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  years!: string[];
  cities: string[] = [];
  xLabels: string[] = [];
  xName: string = '';
  yName: string = '';
  data: number[] = [];
  backendService: DbConnectService;
  queries: string[] = [
    'Display total hospital cases time of each month in a particular year and particular city',
    'Total hospital cases in thousands per month of the hospital which has the most cases time in specified year',
    'Compare two years on various cases times on a given month',
    'Top 5 Hospitals with family cases on a given month and year',
  ];
  series: any = [];
  queryIndex: number = -1;
  monthIndex: number = -1;
  title: string = '';

  // public model: any;

  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2
          ? []
          : this.cities
              .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
              .slice(0, 10)
      )
    );

  constructor(backendService: DbConnectService) {
    this.backendService = backendService;
  }

  ngOnInit(): void {
    this.backendService.getYears().subscribe(
      (response) => {
        console.log(response);
        let responseData: dbData = response as dbData;
        this.years = responseData.rows.map(
          (item) => item['HOSPITAL_YEAR'] as string
        );
      },
      (error) => {
        console.log(error);
      }
    );

    this.backendService.getCities().subscribe(
      (response) => {
        console.log(response);
        let responseData: dbData = response as dbData;
        this.cities = responseData.rows.map((item) => item['CITY'] as string);
        console.log(this.cities);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onSelectYear(year: string) {
    this.selectedYear = year;
  }

  onSelectYear2(year: string) {
    this.selectedYear2 = year;
  }

  onSelectMonth(month: string, i: number) {
    this.selectedMonth = month;
    this.monthIndex = i;
  }

  onSelectQuery(query: string, index: number) {
    this.selectedQuery = query;
    this.queryIndex = index;
    this.isYearVisible = false;
    this.isYear2Visible = false;
    this.isMonthVisible = false;
    this.isCityVisible = false;
    this.selectedYear = 'Year';
    this.selectedYear2 = 'Year2';
    this.selectedMonth = 'Month';
    this.selectedCity = 'City';
    switch (this.queryIndex) {
      case 0:
        this.xName = 'Month';
        this.yName = 'cases in thousands';
        this.isCityVisible = true;
        this.isYearVisible = true;
        break;
      case 1:
        this.xName = 'Month';
        this.yName = 'cases in thousands';
        this.isYearVisible = true;
        break;
      case 2:
        this.xName = 'Year';
        this.yName = 'cases in thousands';
        this.isYearVisible = true;
        this.isYear2Visible = true;
        this.isMonthVisible = true;
        break;
      case 3:
        this.xName = 'Hospitals';
        this.yName = 'cases in thousands';
        this.isYearVisible = true;
        this.isMonthVisible = true;
        break;
    }
  }

  submit() {
    console.log(this.selectedCity);
    switch (this.queryIndex) {
      case 0:
        this.setCasesPerMonth();
        break;
      case 1:
        this.setMostcasesPerYear();
        break;
      case 2:
        this.setCasesTypeCompareByYear();
        break;
      case 3:
        this.setFamilycases();
        break;
    }
  }

  setMostcasesPerYear() {
    if (this.selectedYear != 'Year') {
      this.backendService
        .getMostcasesPerYear(`?year=${this.selectedYear}`)
        .subscribe(
          (response) => {
            console.log(response);
            let responseData: dbData = response as dbData;
            this.xLabels = responseData.rows.map(
              (item) => item['CASES_MONTH'] as string
            );
            let data = responseData.rows.map(
              (item) => item['TOTAL_cases'] as number
            );
            this.title = responseData.rows[0]['CITY_NAME'];
            this.series = [
              {
                data: data,
                type: 'line',
              },
            ];
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  setCasesPerMonth() {
    if (this.selectedYear != 'Year' && this.selectedCity != 'City') {
      this.backendService
        .getCasesPerMonth(
          `?city=\'${this.selectedCity}\'&year=${this.selectedYear}`
        )
        .subscribe(
          (response) => {
            console.log(response);
            let responseData: dbData = response as dbData;
            this.xLabels = responseData.rows.map(
              (item) => item['CASES_MONTH'] as string
            );
            let data = responseData.rows.map(
              (item) => item['TOTAL_TIME'] as number
            );
            this.title = this.selectedCity + ' ' + this.selectedYear;
            this.series = [
              {
                data: data,
                type: 'line',
              },
            ];
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  setCasesTypeCompareByYear() {
    if (
      this.selectedYear != 'Year' &&
      this.selectedYear2 != 'Year2' &&
      this.selectedMonth != 'Month'
    ) {
      this.backendService
        .getCasesTypeCompareByYear(
          `?year=${this.selectedYear}&year2=${this.selectedYear2}&month=${this.monthIndex}`
        )
        .subscribe(
          (response) => {
            console.log(response);
            let responseData: dbData = response as dbData;
            this.xLabels = responseData.rows.map(
              (item) => item['YEAR'] as string
            );
            let meta = responseData.metaData.map((item) => item.name);
            this.title = 'Month: ' + this.selectedMonth;
            console.log(meta);
            let test = [];
            for (const metaKey of meta) {
              if (metaKey != 'YEAR') {
                console.log(metaKey);
                test.push({
                  name: metaKey,
                  type: 'bar',
                  data: responseData.rows.map(
                    (item) => item[metaKey] as number
                  ),
                });
              }
            }
            // @ts-ignore
            this.series = test;
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  setFamilycases() {
    if (this.selectedYear != 'Year' && this.selectedMonth != 'Month') {
      this.backendService
        .getFamilycases(`?year=${this.selectedYear}&month=${this.monthIndex}`)
        .subscribe(
          (response) => {
            console.log(response);
            let responseData: dbData = response as dbData;
            this.xLabels = responseData.rows.map(
              (item) => item['HOSPITAL_NAME'] as string
            );
            let data = responseData.rows.map(
              (item) => item['TOTAL_NO_OF_case'] as number
            );
            this.title =
              'family related cases on Year: ' +
              this.selectedYear +
              ' Month: ' +
              this.selectedMonth;
            this.series = [
              {
                data: data,
                type: 'bar',
              },
            ];
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }
}
