import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbConnectService {
  example = 'http://localhost:7000/example';
  query = 'http://localhost:7000/query/';
  casePerMonth = 'http://localhost:7000/casePerMonth/';
  years = 'http://localhost:7000/getYears';
  cities = 'http://localhost:7000/getCities';
  mostcasePerYear = 'http://localhost:7000/mostcasePerYear/';
  caseTypeCompareByYear = 'http://localhost:7000/caseTypeCompareByYear/';
  familycases = 'http://localhost:7000/familycases/';

  constructor(private http: HttpClient) {}

  getExample(): Observable<object> {
    return this.http.get(this.example);
  }

  getYears(): Observable<object> {
    return this.http.get(this.years);
  }

  getCities(): Observable<object> {
    return this.http.get(this.cities);
  }

  getCasesPerMonth(q: string): Observable<object> {
    const queryToExecute = this.casePerMonth + q;
    return this.http.get(queryToExecute);
  }

  getMostcasesPerYear(q: string): Observable<object> {
    const queryToExecute = this.mostcasePerYear + q;
    return this.http.get(queryToExecute);
  }

  getCasesTypeCompareByYear(q: string): Observable<object> {
    const queryToExecute = this.caseTypeCompareByYear + q;
    return this.http.get(queryToExecute);
  }

  getFamilycases(q: string): Observable<object> {
    const queryToExecute = this.familycases + q;
    return this.http.get(queryToExecute);
  }

  executeQuery(q: string): Observable<object> {
    const queryToExecute = this.query + q;
    return this.http.get(queryToExecute);
  }
}
