// Mock weather generator: 5-day forecast, deterministic per city.
const CONDITIONS = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear', 'Windy'];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function generateForecast(city) {
  const seed = hashStr(city.toLowerCase());
  const baseTemp = 12 + (seed % 25); // 12-36 C average
  const days = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const swing = ((seed + i * 17) % 12) - 6;
    const high = baseTemp + swing + 3;
    const low = baseTemp + swing - 4;
    days.push({
      date: d.toISOString().slice(0, 10),
      condition: CONDITIONS[(seed + i * 3) % CONDITIONS.length],
      highC: high,
      lowC: low,
      humidity: 30 + ((seed + i * 7) % 60),
      windKph: 5 + ((seed + i * 11) % 35),
    });
  }
  return {
    city,
    currentC: baseTemp,
    condition: CONDITIONS[seed % CONDITIONS.length],
    forecast: days,
  };
}

module.exports = { generateForecast };
