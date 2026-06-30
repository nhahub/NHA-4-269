// Mock hotel generator, deterministic per city so demos stay stable.
const NAMES = ['Grand', 'Royal', 'Palm', 'Marina', 'Plaza', 'Continental', 'Oasis', 'Skyline', 'Pearl', 'Garden'];
const SUFFIX = ['Hotel', 'Resort', 'Suites', 'Inn', 'Towers'];
const AMENITIES = ['WiFi', 'Pool', 'Gym', 'Spa', 'Breakfast', 'Parking', 'Beach Access', 'Airport Shuttle'];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function generateHotels(city) {
  const seed = hashStr(city.toLowerCase());
  const count = 5 + (seed % 4); // 5-8 hotels
  const hotels = [];
  for (let i = 0; i < count; i++) {
    const name = `${NAMES[(seed + i * 3) % NAMES.length]} ${SUFFIX[(seed + i * 5) % SUFFIX.length]} ${city}`;
    const stars = 3 + ((seed + i) % 3); // 3-5 stars
    const pricePerNight = 45 + ((seed + i * 37) % 405); // USD 45-450
    const rating = (7 + ((seed + i * 7) % 30) / 10).toFixed(1); // 7.0 - 9.9
    const amenityCount = 3 + ((seed + i) % 4);
    const amenities = [];
    for (let a = 0; a < amenityCount; a++) {
      amenities.push(AMENITIES[(seed + i + a * 2) % AMENITIES.length]);
    }
    hotels.push({
      id: `H${1000 + ((seed + i * 11) % 8999)}`,
      name,
      city,
      stars,
      ratingOutOf10: Number(rating),
      pricePerNightUSD: pricePerNight,
      currency: 'USD',
      amenities: [...new Set(amenities)],
    });
  }
  return hotels.sort((a, b) => a.pricePerNightUSD - b.pricePerNightUSD);
}

module.exports = { generateHotels };
