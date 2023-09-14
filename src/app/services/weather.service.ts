import { from, Observable } from "rxjs";
import { Injectable } from "@angular/core";

export interface IHourlyWeatherRecord {
  temp: string
}

export interface IDailyWeatherRecord {
  temp: { day: number }
}

export interface IWeatherResponse {
  hourly?: IHourlyWeatherRecord[],
  daily?: IDailyWeatherRecord[]
}

@Injectable()
export class WeatherService {

  private API_KEY = "010721642521f31b0fbc8c3831d45951";
  private API_BASE_URL = "https://api.openweathermap.org/data/2.5";

  private sedRequest(lat: string, lon: string, exclude: string[]): Observable<IWeatherResponse> {
    return from(
      fetch(`${this.API_BASE_URL}/onecall?units=metric&lat=${lat}&lon=${lon}&exclude=${exclude.join(',')}&appid=${this.API_KEY}`).then(res => res.json())
    );
  }

  public getHourly(lat: string, lon: string): Observable<IWeatherResponse> {
    return this.sedRequest(lat, lon, ['current', 'minutely', 'daily', 'alerts']);
  }

  public getDaily(lat: string, lon: string): Observable<IWeatherResponse> {
    return this.sedRequest(lat, lon, ['current', 'minutely', 'hourly', 'alerts']);
  }
}
