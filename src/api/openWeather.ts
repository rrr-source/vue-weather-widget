const API_KEY = '1f5c2170ea4a669ceb6f6c3b356c03d1';

export async function findCity(query: string) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=1&appid=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  return data[0] || null;
}

export async function getWeather(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url);
  return res.json();
}

export async function reverseGeocode(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0] || null;
}