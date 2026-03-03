/**
 * Types for Weatherbit API responses.
 * @see https://www.weatherbit.io/api/weather-current
 */

export interface WeatherbitWeather {
  icon: string;
  code: number;
  description: string;
}

export interface WeatherbitCurrentData {
  wind_cdir: string;
  wind_cdir_full: string;
  rh: number;
  pod: string;
  lon: number;
  pres: number;
  timezone: string;
  ob_time: string;
  country_code: string;
  clouds: number;
  vis: number;
  wind_spd: number;
  gust: number;
  app_temp: number;
  state_code: string;
  ts: number;
  dewpt: number;
  weather: WeatherbitWeather;
  uv: number;
  wind_dir: number;
  datetime: string;
  precip: number;
  city_name: string;
  sunrise: string;
  sunset: string;
  temp: number;
  lat: number;
  slp: number;
}

export interface WeatherbitCurrentResponse {
  data: WeatherbitCurrentData[];
  count: number;
}

export interface WeatherbitErrorResponse {
  error?: string;
  [key: string]: unknown;
}
