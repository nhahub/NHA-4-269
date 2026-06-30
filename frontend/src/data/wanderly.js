// Static content for Wanderly's marketing/browse pages, ported from the design
// handoff and restyled to the "Glacia" snow theme. Search uses the live gateway.

export const RATES = {
  USD: { r: 1, s: '$' },
  EGP: { r: 48.5, s: 'E£' },
  GBP: { r: 0.79, s: '£' },
  EUR: { r: 0.92, s: '€' },
  AED: { r: 3.67, s: 'د.إ' },
};
export const CURLIST = [
  { code: 'EGP', label: 'EGP' },
  { code: 'USD', label: 'USD' },
  { code: 'GBP', label: 'GBP' },
  { code: 'EUR', label: 'EUR' },
  { code: 'AED', label: 'AED' },
];

// Carousel filter tabs (matches the "Your Snow Dream Is Here" section).
export const CATEGORIES = ['All', 'Snowfield', 'Villa', 'Apartment', 'Hotel'];

// cat = carousel category · img falls back to picsum via SmartImage if it 404s.
export const DEST = [
  // ❄ Snowy / cold-weather destinations
  { id: 'zermatt', city: 'Zermatt', country: 'Switzerland', code: 'ZRH', from: 'LHR', temp: -4, priceFrom: 240, best: 'Dec – Mar', cat: 'Snowfield', tags: ['Snow', 'Alps', 'Ski'], img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=70', blurb: 'The Matterhorn over a car-free village — powder, fondue and silence.' },
  { id: 'lapland', city: 'Rovaniemi', country: 'Finland', code: 'RVN', from: 'HEL', temp: -9, priceFrom: 210, best: 'Dec – Feb', cat: 'Snowfield', tags: ['Aurora', 'Snow', 'Husky'], img: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=900&q=70', blurb: 'Lapland nights under the northern lights, reindeer and glass igloos.' },
  { id: 'banff', city: 'Banff', country: 'Canada', code: 'YYC', from: 'JFK', temp: -6, priceFrom: 320, best: 'Dec – Mar', cat: 'Snowfield', tags: ['Snow', 'Lakes', 'Nature'], img: 'https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=900&q=70', blurb: 'Frozen turquoise lakes ringed by the Canadian Rockies.' },
  { id: 'hokkaido', city: 'Sapporo', country: 'Japan', code: 'CTS', from: 'HND', temp: -3, priceFrom: 280, best: 'Jan – Feb', cat: 'Snowfield', tags: ['Snow', 'Ski', 'Onsen'], img: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?auto=format&fit=crop&w=900&q=70', blurb: 'The lightest powder on earth, snow festivals and steaming onsen.' },
  { id: 'tromso', city: 'Tromsø', country: 'Norway', code: 'TOS', from: 'OSL', temp: -5, priceFrom: 260, best: 'Nov – Feb', cat: 'Villa', tags: ['Aurora', 'Fjords', 'Snow'], img: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?auto=format&fit=crop&w=900&q=70', blurb: 'Arctic fjords, whale watching and curtains of green sky.' },
  { id: 'innsbruck', city: 'Innsbruck', country: 'Austria', code: 'INN', from: 'CDG', temp: -2, priceFrom: 195, best: 'Dec – Mar', cat: 'Apartment', tags: ['Alps', 'Ski', 'City'], img: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=900&q=70', blurb: 'A storybook old town wrapped by ski slopes in every direction.' },
  { id: 'reykjavik', city: 'Reykjavik', country: 'Iceland', code: 'KEF', from: 'JFK', temp: 1, priceFrom: 289, best: 'Oct – Mar', cat: 'Snowfield', tags: ['Aurora', 'Geysers', 'Nature'], img: 'https://images.unsplash.com/photo-1490650404312-a2175773bbf5?auto=format&fit=crop&w=900&q=70', blurb: 'Waterfalls, geysers and northern lights at the edge of the map.' },
  { id: 'queenstown', city: 'Queenstown', country: 'New Zealand', code: 'ZQN', from: 'SYD', temp: 3, priceFrom: 340, best: 'Jun – Sep', cat: 'Villa', tags: ['Snow', 'Lakes', 'Adventure'], img: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=900&q=70', blurb: 'Southern-hemisphere snow over a lake ringed by jagged peaks.' },
  { id: 'aspen', city: 'Aspen', country: 'USA', code: 'ASE', from: 'JFK', temp: -4, priceFrom: 360, best: 'Dec – Mar', cat: 'Hotel', tags: ['Ski', 'Snow', 'Luxury'], img: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=900&q=70', blurb: 'Champagne powder, après-ski and Rocky Mountain glamour.' },
  // ☀ Warm-weather destinations (kept for range)
  { id: 'dubai', city: 'Dubai', country: 'UAE', code: 'DXB', from: 'CAI', temp: 38, priceFrom: 176, best: 'Nov – Mar', cat: 'Hotel', tags: ['Beaches', 'City', 'Luxury'], img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=70', blurb: 'Sun, souks and skyline — desert glamour with a warm welcome.' },
  { id: 'lisbon', city: 'Lisbon', country: 'Portugal', code: 'LIS', from: 'LHR', temp: 24, priceFrom: 96, best: 'Mar – Jun', cat: 'Apartment', tags: ['Culture', 'Food', 'Coast'], img: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=900&q=70', blurb: 'Pastel hills, tiled streets and custard tarts by the river.' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', code: 'HND', from: 'DXB', temp: 27, priceFrom: 430, best: 'Mar – May', cat: 'City', tags: ['City', 'Food', 'Culture'], img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=70', blurb: 'Neon nights and quiet shrines, ramen counters and cherry blossom.' },
  { id: 'santorini', city: 'Santorini', country: 'Greece', code: 'JTR', from: 'ATH', temp: 26, priceFrom: 210, best: 'May – Sep', cat: 'Villa', tags: ['Coast', 'Romance', 'Views'], img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=70', blurb: 'Whitewashed cliffs above an impossibly blue caldera.' },
  { id: 'bali', city: 'Bali', country: 'Indonesia', code: 'DPS', from: 'DXB', temp: 30, priceFrom: 330, best: 'Apr – Oct', cat: 'Villa', tags: ['Beaches', 'Nature', 'Wellness'], img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=900&q=70', blurb: 'Rice terraces, warm surf and temples wrapped in green.' },
  { id: 'marrakech', city: 'Marrakech', country: 'Morocco', code: 'RAK', from: 'CDG', temp: 33, priceFrom: 88, best: 'Oct – Apr', cat: 'Apartment', tags: ['Culture', 'Food', 'Markets'], img: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=900&q=70', blurb: 'Spice markets, riad courtyards and mint tea in the shade.' },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', code: 'CAI', from: 'JED', temp: 35, priceFrom: 120, best: 'Oct – Apr', cat: 'City', tags: ['History', 'Culture', 'River'], img: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=900&q=70', blurb: 'Pyramids on the skyline, felucca sails and five thousand years of stories.' },
];

export const findDest = (id) => DEST.find((d) => d.id === id || d.code.toLowerCase() === String(id).toLowerCase());

export const DEALS = [
  { fc: 'LHR', tc: 'ZRH', from: 'London', to: 'Zermatt', price: 240, nights: 5, cityId: 'zermatt', img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=70' },
  { fc: 'HEL', tc: 'RVN', from: 'Helsinki', to: 'Rovaniemi', price: 210, nights: 4, cityId: 'lapland', img: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=800&q=70' },
  { fc: 'JFK', tc: 'YYC', from: 'New York', to: 'Banff', price: 320, nights: 6, cityId: 'banff', img: 'https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=800&q=70' },
  { fc: 'OSL', tc: 'TOS', from: 'Oslo', to: 'Tromsø', price: 260, nights: 4, cityId: 'tromso', img: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?auto=format&fit=crop&w=800&q=70' },
  { fc: 'CAI', tc: 'DXB', from: 'Cairo', to: 'Dubai', price: 176, nights: 4, cityId: 'dubai', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=70' },
  { fc: 'CDG', tc: 'RAK', from: 'Paris', to: 'Marrakech', price: 88, nights: 4, cityId: 'marrakech', img: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=70' },
];

export const REVIEWS = [
  { name: 'Mariam H.', loc: 'Cairo, Egypt', rating: 5, color: '#2F6BE6', text: 'I planned our whole Zermatt trip in one sitting. Seeing the flight, hotel and weather together — in pounds — just made sense.' },
  { name: 'Tomás R.', loc: 'Lisbon, Portugal', rating: 5, color: '#4F86D6', text: 'No twelve tabs, no surprise currency maths. It feels calm, like the trip already started.' },
  { name: 'Aisha K.', loc: 'Dubai, UAE', rating: 4, color: '#1E54C4', text: 'Lovely and clear. I wish it booked too, but as a way to compare it is the nicest I have used.' },
  { name: 'Lena M.', loc: 'Berlin, Germany', rating: 5, color: '#2D5FB0', text: 'The weather panel sold me. I packed right for the Lapland cold because I could see the whole week at a glance.' },
  { name: 'Yusuf A.', loc: 'Istanbul, Turkey', rating: 5, color: '#3E78D6', text: 'Cool, clean and fast. Found a cheap Tromsø route I would have missed otherwise.' },
  { name: 'Priya N.', loc: 'Mumbai, India', rating: 4, color: '#6AA0E0', text: 'Beautiful design and honest about being a demo. Exactly the comparison view I wanted.' },
];

export const FAQS = [
  { q: 'Can I actually book a flight or hotel here?', a: 'Not yet — Wanderly is a comparison and planning tool. This build shows mock data so you can explore the experience. Booking links are on the roadmap.' },
  { q: 'Where does the data come from?', a: 'The Search page talks to live microservices behind one gateway — separate flight, hotel, weather and currency services. The browse pages use sample content for this demo.' },
  { q: 'How are prices converted?', a: 'You pick a currency once and every price across flights, hotels and deals updates instantly using a single exchange rate.' },
  { q: 'Why show the weather with my results?', a: 'Because the forecast changes the trip. Seeing the days you will actually be there helps you pick dates, pack right and choose the stay.' },
  { q: 'Do I need an account?', a: 'No account is needed to search. Saving trips and favourites will arrive with accounts — those screens are marked "coming soon".' },
  { q: 'Is my search private?', a: 'There is no tracking in this demo and nothing is stored on a server. Your search lives only in your browser for the session.' },
];

export const STEPS = [
  { n: '1', title: 'Tell us the route', body: 'One origin, one destination, your dates and currency. That is the whole form.' },
  { n: '2', title: 'We gather it all', body: 'Flights, stays and the forecast arrive together, priced the way you think.' },
  { n: '3', title: 'Picture the trip', body: 'Compare at a glance and open any option for the full story. No pressure to book.' },
];

export const TRUST_STATS = [
  { num: '5,000+', label: 'routes compared' },
  { num: '3-in-1', label: 'flights · stays · weather' },
  { num: '5', label: 'currencies, instant' },
  { num: '0', label: 'hidden fees, ever' },
];

export const THINGS = {
  zermatt: ['Ride the Gornergrat railway to the Matterhorn view', 'Carve fresh powder on 360km of pistes', 'Warm up with fondue in a slope-side hut', 'Walk the car-free village at first snow'],
  lapland: ['Chase the northern lights on a night safari', 'Drive your own husky sled across the tundra', 'Sleep under glass in an aurora igloo', 'Meet the reindeer herders of the Arctic'],
  banff: ['Skate on a frozen Lake Louise', 'Soak in the Banff Upper Hot Springs', 'Ride the gondola up Sulphur Mountain', 'Spot elk along the Bow Valley Parkway'],
  dubai: ['Watch sunset from the Burj Khalifa observation deck', 'Wander the gold and spice souks of Deira', 'Take an evening dhow cruise along the creek', 'Float in the warm Gulf at Jumeirah Beach'],
  _default: ['Wander the old town on foot', 'Find the best local food market', 'Catch a viewpoint at golden hour', 'Take a slow day trip nearby'],
};

// Brand-ish colors for airline badges (keyed by IATA code from the gateway).
const AIRLINE_COLORS = {
  MS: '#0B4DA2', EK: '#D32F2F', QR: '#5C0632', TK: '#C2002F',
  LH: '#05164D', SV: '#0E7C4A', FZ: '#0A2E5C',
};
export const airlineColor = (iata) => AIRLINE_COLORS[iata] || '#4F86D6';

export const ratingWord = (r) => (r >= 9 ? 'Superb' : r >= 8.5 ? 'Excellent' : r >= 8 ? 'Great' : 'Good');

// Weather glyph + tile background from a free-text condition.
export function weatherGlyph(condition = '') {
  const c = condition.toLowerCase();
  if (c.includes('snow')) return { glyph: '❄', bg: '#DCE7F4' };
  if (c.includes('rain') || c.includes('drizzle')) return { glyph: '☂', bg: '#CFE0E6' };
  if (c.includes('cloud')) return c.includes('part') ? { glyph: '⛅', bg: '#D6E6F8' } : { glyph: '☁', bg: '#DDE7F3' };
  return { glyph: '☀', bg: '#BFE0FF' };
}

export const initialsOf = (name) => name.split(' ').map((p) => p[0]).join('').slice(0, 2);
export const starsText = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
