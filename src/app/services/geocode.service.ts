import { from, Observable } from "rxjs";
import { Injectable } from "@angular/core";

export interface IGeocodeResponse {
  lat: string,
  lon: string
}

@Injectable()
export class GeocodeService {
  private API_KEY = "010721642521f31b0fbc8c3831d45951";
  private API_BASE_URL = "http://api.openweathermap.org/geo/1.0";

  public getCity(cityName: string): Observable<IGeocodeResponse[]|undefined> {
    return from(
      fetch(`${this.API_BASE_URL}/direct?q=${cityName}&limit=1&appid=${this.API_KEY}`).then(res => res.json())
    );
  }
}
