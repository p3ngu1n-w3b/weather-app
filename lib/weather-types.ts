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

/** 16-day forecast daily item @see https://www.weatherbit.io/api/weather-forecast-16-day */
export interface WeatherbitForecastDay {
  datetime: string;
  valid_date: string;
  ts: number;
  high_temp: number;
  low_temp: number;
  temp?: number;
  weather: WeatherbitWeather;
  rh: number;
  wind_spd: number;
  wind_cdir_full: string;
  pop: number;
  precip: number;
  snow?: number;
  uv?: number;
}

export interface WeatherbitForecastResponse {
  city_name: string;
  country_code: string;
  state_code?: string;
  lat: number;
  lon: number;
  timezone: string;
  data: WeatherbitForecastDay[];
}

/** Daily historical item @see https://www.weatherbit.io/api/historical-weather-daily */
export interface WeatherbitHistoryDay {
  datetime: string;
  ts: number;
  max_temp: number;
  min_temp: number;
  temp: number;
  precip: number;
  snow?: number;
  rh?: number;
  wind_spd?: number;
  clouds?: number;
}

export interface WeatherbitHistoryResponse {
  city_name: string;
  country_code: string;
  state_code?: string;
  lat: number;
  lon: number;
  timezone: string;
  data: WeatherbitHistoryDay[];
}
