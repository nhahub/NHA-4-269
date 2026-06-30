// Mock flight generator. Deterministic-ish based on route so demos look stable.
const AIRLINES = [
  { code: 'MS', name: 'EgyptAir' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'TK', name: 'Turkish Airlines' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'SV', name: 'Saudia' },
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function generateFlights(from, to, date) {
  const seed = hashStr(`${from}-${to}-${date}`);
  const count = 4 + (seed % 4); // 4-7 flights
  const flights = [];
  for (let i = 0; i < count; i++) {
    const airline = AIRLINES[(seed + i * 7) % AIRLINES.length];
    const depHour = (6 + (seed + i * 5) % 16);
    const durationMin = 90 + ((seed + i * 13) % 480); // 1.5h - 9.5h
    const arrTotal = depHour * 60 + durationMin;
    const stops = (seed + i) % 3 === 0 ? 1 : 0;
    const basePrice = 120 + ((seed + i * 29) % 880); // USD
    flights.push({
      id: `${airline.code}${100 + ((seed + i * 3) % 899)}`,
      airline: airline.name,
      airlineCode: airline.code,
      from,
      to,
      date,
      departTime: `${pad(depHour)}:${pad((seed + i * 11) % 60)}`,
      arriveTime: `${pad(Math.floor(arrTotal / 60) % 24)}:${pad(arrTotal % 60)}`,
      durationMinutes: durationMin,
      stops,
      priceUSD: basePrice + stops * -40, // direct costs more
      currency: 'USD',
    });
  }
  return flights.sort((a, b) => a.priceUSD - b.priceUSD);
}

module.exports = { generateFlights };
