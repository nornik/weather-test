import { switchMap, tap, Observable, BehaviorSubject } from "rxjs";
import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  IDailyWeatherRecord,
  IHourlyWeatherRecord,
  IWeatherResponse,
  WeatherService
} from "./services/weather.service";
import { IGeocodeResponse, GeocodeService } from "./services/geocode.service";

type ITable = 'hourly'|'daily'|undefined;
interface IHourlyTableRow {
  cityName: string,
  h3: string,
  h6: string,
  h9: string,
  h12: string,
  h15: string,
  h18: string,
  h21: string,
  h24: string,
}

interface IDailyTableRow {
  cityName: string,
  d1: string,
  d2: string,
  d3: string,
  d4: string,
  d5: string,
  d6: string,
  d7: string
}

const defaultHourlyTableRow: IHourlyTableRow = {
  cityName: '', h3: '', h6: '', h9: '', h12: '', h15: '', h18: '', h21: '', h24: ''
}

const defaultDailyTableRow: IDailyTableRow = {
  cityName: '', d1: '', d2: '', d3: '', d4: '', d5: '', d6: '', d7: ''
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {
  public cityName: string = '';
  public tableType: ITable;
  public dailyColumns: string[] = ['cityName', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'];
  private dailyTableDataSubject$ = new BehaviorSubject<IDailyTableRow[]>([]);
  public dailyTableData$: Observable<IDailyTableRow[]> = this.dailyTableDataSubject$.asObservable();
  public hourlyColumns: string[] = ['cityName', 'h3', 'h6', 'h9', 'h12', 'h15', 'h18', 'h21', 'h24'];
  private hourlyTableDataSubject$ = new BehaviorSubject<IHourlyTableRow[]>([]);
  public hourlyTableData$: Observable<IHourlyTableRow[]> = this.hourlyTableDataSubject$.asObservable();

  constructor(
    private geocode: GeocodeService,
    private weather: WeatherService
  ) { }

  onHourlyFilterClick() {
    if (this.cityName.length === 0) {
      return
    }

    const tableRows = this.hourlyTableDataSubject$.getValue();
    const isRowExists = tableRows.some((item: IHourlyTableRow) => item.cityName === this.cityName);

    if (!isRowExists) {
      this.getCityHourlyData(tableRows);
    }

    this.tableType = 'hourly';
  }

  onDailyFilterClick() {
    if (this.cityName.length === 0) {
      return
    }

    const tableRows = this.dailyTableDataSubject$.getValue();
    const isRowExists = tableRows.some((item: IDailyTableRow) => item.cityName === this.cityName);

    if (!isRowExists) {
      this.getCityDailyData(tableRows);
    }

    this.tableType = 'daily';
  }

  private getCityHourlyData(tableRows: IHourlyTableRow[]): void {
    this.geocode.getCity(this.cityName).pipe(
      switchMap((response: IGeocodeResponse[]|undefined) => {
        if (response) {
          const { lat, lon } = response[0];
          return this.weather.getHourly(lat, lon);
        }

        return [];
      }),
      tap((response: IWeatherResponse|undefined) => {
        if (response && response.hourly) {
          const row: IHourlyTableRow = {
            ...defaultHourlyTableRow,
            cityName: this.cityName
          };

          response.hourly.map((item: IHourlyWeatherRecord, index) => {
            if ((index > 0) && (index < 24) && ((index + 1) % 3 === 0)) {
              const key = 'h' + (index + 1);
              // @ts-ignore
              row[key] = String(item.temp);
            }
          })

          tableRows.push(row);
          this.hourlyTableDataSubject$.next(tableRows);
        }
      })
    ).subscribe();
  }

  private getCityDailyData(tableRows: IDailyTableRow[]): void {
    this.geocode.getCity(this.cityName).pipe(
      switchMap((response: IGeocodeResponse[]|undefined) => {
        if (response) {
          const { lat, lon } = response[0];
          return this.weather.getDaily(lat, lon)
        }

        return [];
      }),
      tap((response: IWeatherResponse|undefined) => {
        if (response && response.daily) {
          const row: IDailyTableRow = {
            ...defaultDailyTableRow,
            cityName: this.cityName
          };

          response.daily.map((item: IDailyWeatherRecord, index: number) => {
            if (index < 7) {
              const key = 'd' + (index + 1);
              // @ts-ignore
              row[key] = String(item.temp.day);
            }
          })

          const rows = this.dailyTableDataSubject$.getValue();
          rows.push(row);

          this.dailyTableDataSubject$.next(rows);
        }
      })
    ).subscribe();
  }

  private setURL(search: string = ''): void {
    location.search = search;
  }

  private formatDate(date: number): string {
    return new Intl.DateTimeFormat("ru-Ru", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date)
  }
}
