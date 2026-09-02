const CSC_BASE_URL = 'https://api.countrystatecity.in/v1';

// Server-side in-memory cache to prevent redundant API calls
const memoryCache = {
  countries: null,
  states: new Map(), // countryIso -> states array
  cities: new Map()  // `${countryIso}_${stateIso}` -> cities array
};

const getCscApiKey = () => {
  return process.env.CSC_API_KEY || process.env.COUNTRY_STATE_CITY_API_KEY || '';
};

/**
 * Helper: Perform API fetch with fallback to open location services
 */
const fetchWithFallback = async (cscEndpoint, fallbackFn) => {
  const apiKey = getCscApiKey();

  if (apiKey) {
    try {
      const response = await fetch(`${CSC_BASE_URL}${cscEndpoint}`, {
        headers: {
          'X-CSCAPI-KEY': apiKey
        }
      });
      if (response.ok) {
        return { status: response.status, data: await response.json(), source: 'CSC API' };
      }
    } catch (err) {
      console.warn(`[Location API] CSC API failed for ${cscEndpoint}, using fallback:`, err.message);
    }
  }

  // Fallback to free open location service
  return await fallbackFn();
};

/**
 * Internal loader for Countries
 */
const loadCountriesInternal = async () => {
  if (memoryCache.countries) return memoryCache.countries;

  const result = await fetchWithFallback('/countries', async () => {
    // Open CDN fallback
    const cdnRes = await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json');
    if (cdnRes.ok) {
      return { status: cdnRes.status, data: await cdnRes.json(), source: 'dr5hn CDN' };
    }
    // Backup fallback
    const cNowRes = await fetch('https://countriesnow.space/api/v0.1/countries');
    const cNowData = await cNowRes.json();
    return {
      status: cNowRes.status,
      data: (cNowData.data || []).map((c, idx) => ({
        id: idx + 1,
        name: c.country,
        iso2: c.iso2 || c.country.substring(0, 2).toUpperCase()
      })),
      source: 'CountriesNow'
    };
  });

  const formatted = (result.data || [])
    .map(c => ({
      id: c.id || c.iso2,
      name: c.name || c.country,
      iso2: (c.iso2 || c.code || '').toUpperCase()
    }))
    .filter(c => c.name && c.iso2)
    .sort((a, b) => a.name.localeCompare(b.name));

  memoryCache.countries = formatted;
  return formatted;
};

/**
 * Internal loader for States
 */
const loadStatesInternal = async (countryIso) => {
  const cIso = countryIso.toUpperCase();
  if (memoryCache.states.has(cIso)) return memoryCache.states.get(cIso);

  const countries = await loadCountriesInternal();
  const countryObj = countries.find(c => c.iso2 === cIso);
  const countryName = countryObj ? countryObj.name : cIso;

  const result = await fetchWithFallback(`/countries/${cIso}/states`, async () => {
    const cNowRes = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName })
    });
    if (cNowRes.ok) {
      const cNowData = await cNowRes.json();
      return {
        status: cNowRes.status,
        data: (cNowData.data?.states || []).map((s, idx) => ({
          id: idx + 1,
          name: s.name,
          iso2: (s.state_code || s.name.substring(0, 2)).toUpperCase()
        })),
        source: 'CountriesNow'
      };
    }

    // CDN backup filter
    const cdnRes = await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/states.json');
    if (cdnRes.ok) {
      const allStates = await cdnRes.json();
      return {
        status: cdnRes.status,
        data: allStates.filter(s => s.country_code === cIso),
        source: 'dr5hn CDN'
      };
    }
    return { status: 404, data: [], source: 'None' };
  });

  const formatted = (result.data || [])
    .map(s => ({
      id: s.id || s.iso2 || s.state_code,
      name: s.name,
      iso2: (s.iso2 || s.state_code || s.name.substring(0, 2)).toUpperCase()
    }))
    .filter(s => s.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  memoryCache.states.set(cIso, formatted);
  return formatted;
};

/**
 * @desc    Get all Countries
 * @route   GET /api/locations/countries
 * @access  Public
 */
const getCountries = async (req, res, next) => {
  try {
    const countries = await loadCountriesInternal();
    console.log(`[CITY API - GET /countries] Returned ${countries.length} countries.`);
    return res.json({ success: true, count: countries.length, countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch countries' });
  }
};

/**
 * @desc    Get States for a specific Country
 * @route   GET /api/locations/countries/:countryIso/states
 * @access  Public
 */
const getStates = async (req, res, next) => {
  try {
    const countryIso = (req.params.countryIso || '').toUpperCase();
    if (!countryIso || countryIso === 'ALL') {
      return res.json({ success: true, count: 0, states: [] });
    }

    const states = await loadStatesInternal(countryIso);
    console.log(`[CITY API - GET /countries/${countryIso}/states] Returned ${states.length} states.`);
    return res.json({ success: true, count: states.length, states });
  } catch (error) {
    console.error(`Error fetching states for ${req.params.countryIso}:`, error);
    return res.status(500).json({ success: false, message: 'Failed to fetch states' });
  }
};

/**
 * @desc    Get Cities for a specific State in a Country
 * @route   GET /api/locations/countries/:countryIso/states/:stateIso/cities
 * @access  Public
 */
const getCities = async (req, res, next) => {
  try {
    const countryIso = (req.params.countryIso || '').toUpperCase();
    const stateIso = (req.params.stateIso || '').toUpperCase();

    if (!countryIso || countryIso === 'ALL' || !stateIso || stateIso === 'ALL') {
      return res.json({ success: true, count: 0, cities: [] });
    }

    const cacheKey = `${countryIso}_${stateIso}`;
    if (memoryCache.cities.has(cacheKey)) {
      const cached = memoryCache.cities.get(cacheKey);
      console.log(`[CITY API - GET /cities (CACHED)] ${countryIso}/${stateIso} -> ${cached.length} cities.`);
      return res.json({ success: true, count: cached.length, cities: cached });
    }

    // Resolve full Country Name and State Name for CountriesNow POST request
    const countries = await loadCountriesInternal();
    const countryObj = countries.find(c => c.iso2 === countryIso);
    const countryName = countryObj ? countryObj.name : countryIso;

    const states = await loadStatesInternal(countryIso);
    const stateObj = states.find(s => s.iso2 === stateIso || s.name.toLowerCase() === stateIso.toLowerCase());
    const stateName = stateObj ? stateObj.name : stateIso;

    const apiUrl = `${CSC_BASE_URL}/countries/${countryIso}/states/${stateIso}/cities`;
    console.log(`[CITY API - REQUEST] Target URL: ${apiUrl} (Country: "${countryName}", State: "${stateName}")`);

    const result = await fetchWithFallback(`/countries/${countryIso}/states/${stateIso}/cities`, async () => {
      const cNowUrl = 'https://countriesnow.space/api/v0.1/countries/state/cities';
      const cNowRes = await fetch(cNowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName, state: stateName })
      });

      console.log(`[CITY API - FALLBACK RESPONSE] URL: ${cNowUrl} | Status: ${cNowRes.status}`);
      if (cNowRes.ok) {
        const cNowData = await cNowRes.json();
        console.log(`[CITY API - RESPONSE DATA] Count: ${cNowData.data?.length || 0}`);
        return {
          status: cNowRes.status,
          data: (cNowData.data || []).map((cityName, idx) => ({
            id: idx + 1,
            name: cityName
          })),
          source: 'CountriesNow'
        };
      }
      return { status: cNowRes.status, data: [], source: 'CountriesNow' };
    });

    const formatted = (result.data || [])
      .map((c, idx) => ({
        id: c.id || `${stateIso}_${idx + 1}`,
        name: typeof c === 'string' ? c : c.name
      }))
      .filter(c => c.name && typeof c.name === 'string')
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`[CITY API - SUCCESS] ${countryIso}/${stateIso} -> Formatted ${formatted.length} cities.`);
    memoryCache.cities.set(cacheKey, formatted);
    return res.json({ success: true, count: formatted.length, cities: formatted });
  } catch (error) {
    console.error(`Error fetching cities for ${req.params.countryIso}/${req.params.stateIso}:`, error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};

module.exports = {
  getCountries,
  getStates,
  getCities
};
