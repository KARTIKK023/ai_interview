import API from './api';

// Frontend in-memory cache to prevent redundant API calls
const locationCache = {
  countries: null,
  states: new Map(), // countryIso -> states array
  cities: new Map()  // `${countryIso}_${stateIso}` -> cities array
};

export const fetchCountries = async () => {
  if (locationCache.countries) {
    console.log('[LOCATION SERVICE] Returning cached countries:', locationCache.countries.length);
    return locationCache.countries;
  }

  try {
    const url = '/locations/countries';
    console.log('[LOCATION SERVICE] GET Countries API Request:', url);
    const res = await API.get(url);
    console.log('[LOCATION SERVICE] GET Countries API Response Status:', res.status, 'Count:', res.data?.count);
    if (res.data && res.data.success) {
      locationCache.countries = res.data.countries || [];
      return locationCache.countries;
    }
  } catch (err) {
    console.error('[LOCATION SERVICE] Error fetching countries:', err.message);
  }
  return [];
};

export const fetchStatesByCountry = async (countryIso) => {
  if (!countryIso || countryIso === 'ALL') return [];

  const isoUpper = countryIso.toUpperCase();
  if (locationCache.states.has(isoUpper)) {
    console.log(`[LOCATION SERVICE] Returning cached states for ${isoUpper}:`, locationCache.states.get(isoUpper).length);
    return locationCache.states.get(isoUpper);
  }

  try {
    const url = `/locations/countries/${isoUpper}/states`;
    console.log('[LOCATION SERVICE] GET States API Request:', url);
    const res = await API.get(url);
    console.log(`[LOCATION SERVICE] GET States API Response Status for ${isoUpper}:`, res.status, 'Count:', res.data?.count);
    if (res.data && res.data.success) {
      const states = res.data.states || [];
      locationCache.states.set(isoUpper, states);
      return states;
    }
  } catch (err) {
    console.error(`[LOCATION SERVICE] Error fetching states for ${countryIso}:`, err.message);
  }
  return [];
};

export const fetchCitiesByState = async (countryIso, stateIso) => {
  if (!countryIso || countryIso === 'ALL' || !stateIso || stateIso === 'ALL') return [];

  const cUpper = countryIso.toUpperCase();
  const sUpper = stateIso.toUpperCase();
  const cacheKey = `${cUpper}_${sUpper}`;

  if (locationCache.cities.has(cacheKey)) {
    console.log(`[LOCATION SERVICE] Returning cached cities for ${cacheKey}:`, locationCache.cities.get(cacheKey).length);
    return locationCache.cities.get(cacheKey);
  }

  try {
    const url = `/locations/countries/${cUpper}/states/${sUpper}/cities`;
    console.log('[LOCATION SERVICE] GET Cities API Request:', url);
    const res = await API.get(url);
    console.log(`[LOCATION SERVICE] GET Cities API Response Status for ${cacheKey}:`, res.status, 'Data Count:', res.data?.count);
    if (res.data && res.data.success) {
      const cities = res.data.cities || [];
      locationCache.cities.set(cacheKey, cities);
      return cities;
    }
  } catch (err) {
    console.error(`[LOCATION SERVICE] Error fetching cities for ${countryIso}/${stateIso}:`, err.message);
  }
  return [];
};
