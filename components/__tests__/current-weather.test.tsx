import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentWeather } from "../current-weather";
import type { WeatherbitCurrentData } from "@/lib/weather-types";

const mockData: WeatherbitCurrentData = {
  city_name: "London",
  state_code: "ENG",
  country_code: "UK",
  temp: 14.5,
  app_temp: 13.2,
  weather: {
    icon: "c03d",
    code: 803,
    description: "Broken clouds",
  },
  rh: 72,
  wind_spd: 4.5,
  wind_cdir_full: "southwest",
  uv: 3,
  vis: 10,
  sunrise: "06:45",
  sunset: "17:30",
  wind_cdir: "SW",
  pod: "d",
  lon: -0.13,
  pres: 1012,
  timezone: "Europe/London",
  ob_time: "2025-03-03 12:00",
  clouds: 75,
  gust: 6,
  dewpt: 9.5,
  ts: 1740000000,
  wind_dir: 225,
  datetime: "2025-03-03:12",
  precip: 0,
  lat: 51.51,
  slp: 1015,
};

describe("CurrentWeather", () => {
  it("renders location and temperature", () => {
    render(<CurrentWeather data={mockData} />);
    expect(screen.getByText(/London, ENG, UK/)).toBeInTheDocument();
    expect(screen.getByText("15°C")).toBeInTheDocument(); // rounded temp
    expect(screen.getByText("Broken clouds")).toBeInTheDocument();
  });

  it("renders detail items", () => {
    render(<CurrentWeather data={mockData} />);
    expect(screen.getByText("Humidity")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.getByText("Wind")).toBeInTheDocument();
    expect(screen.getByText(/4.5 m\/s southwest/)).toBeInTheDocument();
  });
});
