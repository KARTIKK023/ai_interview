import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import API from '../../services/api';

import {
  fetchCountries,
  fetchStatesByCountry,
  fetchCitiesByState
} from '../../services/locationService';

import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaBuilding,
  FaClock,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaRedo,
  FaPlusCircle,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaChevronRight
} from 'react-icons/fa';

import toast from 'react-hot-toast';

const PlacementOpportunities = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [targetJobs, setTargetJobs] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [hasTargetJobs, setHasTargetJobs] = useState(true);

  // Target Job Filter
  const [selectedTargetJob, setSelectedTargetJob] = useState('ALL');

  // Cascading Location Filters
  const [selectedCountryIso, setSelectedCountryIso] = useState('IN');
  const [selectedStateIso, setSelectedStateIso] = useState('ALL');
  const [selectedCityName, setSelectedCityName] = useState('ALL');

  // Location Lists
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // Location Loading States
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // ------------------------------------------------------------
  // INITIAL LOAD - COUNTRIES
  // ------------------------------------------------------------

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);

      const data = await fetchCountries();

      setCountriesList(data || []);
    } catch (err) {
      console.error('Failed to load countries:', err);
    } finally {
      setLoadingCountries(false);
    }
  };

  // ------------------------------------------------------------
  // COUNTRY -> STATES
  // ------------------------------------------------------------

  useEffect(() => {
    if (
      !selectedCountryIso ||
      selectedCountryIso === 'ALL'
    ) {
      setStatesList([]);
      setCitiesList([]);
      setSelectedStateIso('ALL');
      setSelectedCityName('ALL');

      return;
    }

    const loadStates = async () => {
      try {
        setLoadingStates(true);

        const states = await fetchStatesByCountry(
          selectedCountryIso
        );

        setStatesList(states || []);
      } catch (err) {
        console.error(
          `Failed to load states for ${selectedCountryIso}:`,
          err
        );

        setStatesList([]);
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, [selectedCountryIso]);

  // ------------------------------------------------------------
  // STATE -> CITIES
  // ------------------------------------------------------------

  useEffect(() => {
    setCitiesList([]);
    setSelectedCityName('ALL');

    if (
      !selectedCountryIso ||
      selectedCountryIso === 'ALL' ||
      !selectedStateIso ||
      selectedStateIso === 'ALL'
    ) {
      return;
    }

    const loadCities = async () => {
      try {
        setLoadingCities(true);

        console.log(
          `[FE PLACEMENT PAGE] Triggering City API request for Country ISO: "${selectedCountryIso}", State ISO: "${selectedStateIso}"`
        );

        const cities = await fetchCitiesByState(
          selectedCountryIso,
          selectedStateIso
        );

        console.log(
          `[FE PLACEMENT PAGE] Received ${
            cities ? cities.length : 0
          } cities for State ISO: "${selectedStateIso}"`
        );

        setCitiesList(cities || []);
      } catch (err) {
        console.error(
          `[FE PLACEMENT PAGE] Failed to load cities for ${selectedCountryIso}/${selectedStateIso}:`,
          err
        );

        setCitiesList([]);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [selectedCountryIso, selectedStateIso]);

  // ------------------------------------------------------------
  // FETCH PLACEMENT DATA
  // ------------------------------------------------------------

  useEffect(() => {
    fetchPlacementData();
  }, [
    selectedTargetJob,
    selectedCountryIso,
    selectedStateIso,
    selectedCityName
  ]);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      setError('');

      const selectedCountryObj = countriesList.find(
        (country) => country.iso2 === selectedCountryIso
      );

      const selectedStateObj = statesList.find(
        (state) => state.iso2 === selectedStateIso
      );

      const countryParam =
        selectedCountryIso === 'ALL'
          ? 'ALL'
          : selectedCountryObj?.name || selectedCountryIso;

      const stateParam =
        selectedStateIso === 'ALL'
          ? 'ALL'
          : selectedStateObj?.name || selectedStateIso;

      const cityParam = selectedCityName;

      const res = await API.get('/placement-opportunities', {
        params: {
          targetJob: selectedTargetJob,
          country: countryParam,
          state: stateParam,
          city: cityParam
        }
      });

      if (res.data.success) {
        setHasTargetJobs(res.data.hasTargetJobs !== false);
        setTargetJobs(res.data.targetJobs || []);
        setOpportunities(res.data.opportunities || []);
      } else {
        setError(
          res.data.message ||
            'Failed to load placement opportunities.'
        );
      }
    } catch (err) {
      console.error(
        'Error loading placement opportunities:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Server error while fetching job opportunities. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // FILTER HANDLERS
  // ------------------------------------------------------------

  const handleCountryChange = (e) => {
    const newCountryIso = e.target.value;

    setSelectedCountryIso(newCountryIso);
    setSelectedStateIso('ALL');
    setSelectedCityName('ALL');
  };

  const handleStateChange = (e) => {
    const newStateIso = e.target.value;

    setSelectedStateIso(newStateIso);
    setSelectedCityName('ALL');
  };

  const handleCityChange = (e) => {
    setSelectedCityName(e.target.value);
  };

  // ------------------------------------------------------------
  // LOCATION MATCHING
  // ------------------------------------------------------------

  const isLocationMatch = (jobLocationRaw) => {
    const loc = (jobLocationRaw || '').toLowerCase().trim();

    if (!loc) return false;

    const isCountryActive =
      selectedCountryIso &&
      selectedCountryIso !== 'ALL';

    const isStateActive =
      selectedStateIso &&
      selectedStateIso !== 'ALL';

    const isCityActive =
      selectedCityName &&
      selectedCityName !== 'ALL';

    if (
      !isCountryActive &&
      !isStateActive &&
      !isCityActive
    ) {
      return true;
    }

    // Country matching
    let matchesCountry = true;

    if (isCountryActive) {
      const countryObj = countriesList.find(
        (country) =>
          country.iso2 === selectedCountryIso
      );

      const countryName = countryObj
        ? countryObj.name.toLowerCase()
        : selectedCountryIso.toLowerCase();

      matchesCountry =
        loc.includes(countryName) ||
        loc.includes(selectedCountryIso.toLowerCase());

      // India aliases
      if (selectedCountryIso === 'IN') {
        matchesCountry =
          matchesCountry ||
          loc.includes('india') ||
          loc.includes('delhi') ||
          loc.includes('bangalore') ||
          loc.includes('bengaluru') ||
          loc.includes('mumbai') ||
          loc.includes('hyderabad') ||
          loc.includes('pune') ||
          loc.includes('chennai') ||
          loc.includes('gurgaon') ||
          loc.includes('noida');
      }

      // USA aliases
      if (selectedCountryIso === 'US') {
        matchesCountry =
          matchesCountry ||
          loc.includes('us') ||
          loc.includes('usa') ||
          loc.includes('united states');
      }
    }

    if (!matchesCountry) return false;

    // City matching
    if (isCityActive) {
      const matchesCity = loc.includes(
        selectedCityName.toLowerCase()
      );

      if (!matchesCity) return false;

      // If state is present, validate it
      if (isStateActive) {
        const stateObj = statesList.find(
          (state) =>
            state.iso2 === selectedStateIso
        );

        const stateName = stateObj
          ? stateObj.name.toLowerCase()
          : selectedStateIso.toLowerCase();

        if (
          loc.includes(stateName) ||
          loc.includes(selectedStateIso.toLowerCase())
        ) {
          return true;
        }
      }

      return true;
    }

    // State matching
    if (isStateActive) {
      const stateObj = statesList.find(
        (state) =>
          state.iso2 === selectedStateIso
      );

      const stateName = stateObj
        ? stateObj.name.toLowerCase()
        : selectedStateIso.toLowerCase();

      if (
        loc.includes(stateName) ||
        loc.includes(selectedStateIso.toLowerCase())
      ) {
        return true;
      }

      // Accept matching city in state
      return citiesList.some((city) =>
        loc.includes(city.name.toLowerCase())
      );
    }

    return true;
  };

  // ------------------------------------------------------------
  // FILTER OPPORTUNITIES
  // ------------------------------------------------------------

  const filteredOpportunities =
    opportunities.filter((job) => {
      if (
        selectedTargetJob !== 'ALL' &&
        job.targetJobRole !== selectedTargetJob
      ) {
        return false;
      }

      if (!isLocationMatch(job.location)) {
        return false;
      }

      return true;
    });

  // ------------------------------------------------------------
  // APPLY NOW
  // ------------------------------------------------------------

  const handleApplyNow = (
    applyUrl,
    jobTitle,
    company
  ) => {
    if (!applyUrl) {
      toast.error(
        'Application link unavailable for this listing.'
      );

      return;
    }

    toast.success(
      `Opening application page for ${company}...`
    );

    window.open(
      applyUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // ------------------------------------------------------------
  // ACTIVE LOCATION LABEL
  // ------------------------------------------------------------

  const getActiveLocationLabel = () => {
    const countryObj = countriesList.find(
      (country) =>
        country.iso2 === selectedCountryIso
    );

    const stateObj = statesList.find(
      (state) =>
        state.iso2 === selectedStateIso
    );

    const parts = [];

    if (
      selectedCityName &&
      selectedCityName !== 'ALL'
    ) {
      parts.push(selectedCityName);
    }

    if (stateObj) {
      parts.push(stateObj.name);
    }

    if (countryObj) {
      parts.push(countryObj.name);
    }

    return parts.length > 0
      ? parts.join(', ')
      : 'All Locations';
  };

  // ------------------------------------------------------------
  // RESET FILTERS
  // ------------------------------------------------------------

  const resetFilters = () => {
    setSelectedTargetJob('ALL');
    setSelectedCountryIso('ALL');
    setSelectedStateIso('ALL');
    setSelectedCityName('ALL');
  };

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <StudentLayout>
      <div className="container-fluid py-3">

        {/* =====================================================
            HERO
        ===================================================== */}

        <div
          className="position-relative overflow-hidden mb-4"
          style={{
            background:
              'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            borderRadius: '18px',
            border: '1px solid #273449',
            boxShadow:
              '0 10px 30px rgba(15, 23, 42, 0.12)'
          }}
        >
          <div
            className="position-absolute"
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background:
                'rgba(99, 102, 241, 0.10)',
              top: '-100px',
              right: '-50px'
            }}
          />

          <div
            className="position-absolute"
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background:
                'rgba(56, 189, 248, 0.08)',
              bottom: '-70px',
              right: '220px'
            }}
          />

          <div className="p-4 p-lg-5 position-relative">
            <div className="row align-items-center">

              <div className="col-lg-8">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span
                    className="badge rounded-pill px-3 py-2"
                    style={{
                      background:
                        'rgba(99, 102, 241, 0.16)',
                      color: '#c7d2fe',
                      border:
                        '1px solid rgba(129, 140, 248, 0.25)'
                    }}
                  >
                    <FaBriefcase className="me-2" />
                    Live Opportunities
                  </span>

                  <span
                    className="badge rounded-pill px-3 py-2"
                    style={{
                      background:
                        'rgba(16, 185, 129, 0.12)',
                      color: '#a7f3d0',
                      border:
                        '1px solid rgba(52, 211, 153, 0.20)'
                    }}
                  >
                    <FaCheckCircle className="me-2" />
                    Verified Apply Links
                  </span>
                </div>

                <h2
                  className="fw-bold text-white mb-2"
                  style={{
                    fontSize: 'clamp(1.7rem, 3vw, 2.35rem)',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Placement Opportunities
                </h2>

                <p
                  className="mb-0"
                  style={{
                    color: '#cbd5e1',
                    maxWidth: '680px',
                    lineHeight: '1.7'
                  }}
                >
                  Discover jobs and internships matched to
                  your target roles, skills, and preferred
                  locations.
                </p>
              </div>

              <div className="col-lg-4 d-none d-lg-flex justify-content-end">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '24px',
                    background:
                      'rgba(255, 255, 255, 0.06)',
                    border:
                      '1px solid rgba(255, 255, 255, 0.10)'
                  }}
                >
                  <FaBriefcase
                    size={42}
                    style={{ color: '#93c5fd' }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =====================================================
            FILTER TOOLBAR
        ===================================================== */}

        <div
          className="card border-0 mb-4"
          style={{
            borderRadius: '16px',
            boxShadow:
              '0 5px 20px rgba(15, 23, 42, 0.06)',
            border:
              '1px solid #e5e7eb'
          }}
        >
          <div className="card-body p-3 p-lg-4">

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '9px',
                      background: '#eef2ff',
                      color: '#4f46e5'
                    }}
                  >
                    <FaFilter size={14} />
                  </div>

                  <h6 className="fw-bold text-dark mb-0">
                    Filter Opportunities
                  </h6>
                </div>

                <p className="text-muted small mb-0 mt-1 ms-5">
                  Refine opportunities by role and location
                </p>
              </div>

              {(selectedTargetJob !== 'ALL' ||
                selectedCountryIso !== 'ALL' ||
                selectedStateIso !== 'ALL' ||
                selectedCityName !== 'ALL') && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none fw-semibold mt-2 mt-md-0"
                  onClick={resetFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="row g-3">

              {/* Target Job */}

              <div className="col-12 col-md-6 col-xl-3">
                <label
                  className="form-label small fw-semibold text-secondary mb-2"
                >
                  Target Job
                </label>

                <select
                  className="form-select border bg-light"
                  value={selectedTargetJob}
                  onChange={(e) =>
                    setSelectedTargetJob(e.target.value)
                  }
                  style={{
                    minHeight: '44px',
                    borderRadius: '10px',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="ALL">
                    All Target Jobs ({targetJobs.length})
                  </option>

                  {targetJobs.map((tj) => (
                    <option
                      key={tj._id}
                      value={tj.role}
                    >
                      {tj.role}
                      {tj.company
                        ? ` (${tj.company})`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}

              <div className="col-12 col-md-6 col-xl-3">
                <label
                  className="form-label small fw-semibold text-secondary mb-2"
                >
                  Country
                </label>

                <div className="position-relative">
                  <select
                    className="form-select border bg-light"
                    value={selectedCountryIso}
                    onChange={handleCountryChange}
                    disabled={loadingCountries}
                    style={{
                      minHeight: '44px',
                      borderRadius: '10px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="ALL">
                      All Countries
                    </option>

                    {countriesList.map((country) => (
                      <option
                        key={country.iso2}
                        value={country.iso2}
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>

                  {loadingCountries && (
                    <FaSpinner
                      className="position-absolute text-primary"
                      style={{
                        right: '14px',
                        top: '14px',
                        animation:
                          'spin 1s linear infinite'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* State */}

              <div className="col-12 col-md-6 col-xl-3">
                <label
                  className="form-label small fw-semibold text-secondary mb-2"
                >
                  State / Province
                </label>

                <div className="position-relative">
                  <select
                    className="form-select border bg-light"
                    value={selectedStateIso}
                    disabled={
                      selectedCountryIso === 'ALL' ||
                      !selectedCountryIso ||
                      loadingStates
                    }
                    onChange={handleStateChange}
                    style={{
                      minHeight: '44px',
                      borderRadius: '10px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="ALL">
                      {selectedCountryIso === 'ALL'
                        ? 'Select State'
                        : 'All States'}
                    </option>

                    {statesList.map((state) => (
                      <option
                        key={state.iso2}
                        value={state.iso2}
                      >
                        {state.name}
                      </option>
                    ))}
                  </select>

                  {loadingStates && (
                    <FaSpinner
                      className="position-absolute text-primary"
                      style={{
                        right: '14px',
                        top: '14px',
                        animation:
                          'spin 1s linear infinite'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* City */}

              <div className="col-12 col-md-6 col-xl-3">
                <label
                  className="form-label small fw-semibold text-secondary mb-2"
                >
                  City
                </label>

                <div className="position-relative">
                  <select
                    className="form-select border bg-light"
                    value={selectedCityName}
                    disabled={
                      selectedStateIso === 'ALL' ||
                      !selectedStateIso ||
                      loadingCities ||
                      (citiesList.length === 0 &&
                        !loadingCities)
                    }
                    onChange={handleCityChange}
                    style={{
                      minHeight: '44px',
                      borderRadius: '10px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {loadingCities ? (
                      <option value="ALL">
                        Loading cities...
                      </option>
                    ) : selectedStateIso === 'ALL' ||
                      !selectedStateIso ? (
                      <option value="ALL">
                        Select City
                      </option>
                    ) : citiesList.length === 0 ? (
                      <option value="ALL">
                        No cities found
                      </option>
                    ) : (
                      <>
                        <option value="ALL">
                          All Cities ({citiesList.length})
                        </option>

                        {citiesList.map((city) => (
                          <option
                            key={city.id}
                            value={city.name}
                          >
                            {city.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>

                  {loadingCities && (
                    <FaSpinner
                      className="position-absolute text-primary"
                      style={{
                        right: '14px',
                        top: '14px',
                        animation:
                          'spin 1s linear infinite'
                      }}
                    />
                  )}
                </div>
              </div>

            </div>

            {/* Active Filter Summary */}

            <div
              className="d-flex flex-wrap align-items-center gap-2 mt-4 pt-3 border-top"
            >
              <span className="text-muted small">
                <FaSearch
                  className="me-2"
                  style={{ fontSize: '11px' }}
                />
                Showing results for:
              </span>

              <span
                className="badge rounded-pill fw-semibold"
                style={{
                  background: '#eef2ff',
                  color: '#4338ca',
                  padding: '7px 11px'
                }}
              >
                {selectedTargetJob === 'ALL'
                  ? 'All Target Jobs'
                  : selectedTargetJob}
              </span>

              <span className="text-muted">•</span>

              <span
                className="badge rounded-pill fw-semibold"
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '7px 11px'
                }}
              >
                <FaMapMarkerAlt
                  className="me-1"
                  size={10}
                />
                {getActiveLocationLabel()}
              </span>
            </div>

          </div>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div
            className="card border-0 text-center py-5 mb-4"
            style={{
              borderRadius: '16px',
              boxShadow:
                '0 5px 20px rgba(15, 23, 42, 0.05)'
            }}
          >
            <div
              className="spinner-border text-primary mb-3"
              style={{
                width: '2.7rem',
                height: '2.7rem'
              }}
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <h5 className="fw-bold text-dark mb-2">
              Finding the right opportunities
            </h5>

            <p className="text-muted small mb-0">
              Matching jobs with your target roles and
              preferred location.
            </p>
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <div
            className="card border-0 text-center p-5 mb-4"
            style={{
              borderRadius: '16px',
              boxShadow:
                '0 5px 20px rgba(15, 23, 42, 0.05)'
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626'
              }}
            >
              <FaExclamationCircle size={30} />
            </div>

            <h5 className="fw-bold text-dark mb-2">
              Unable to Fetch Opportunities
            </h5>

            <p
              className="text-muted small mb-4 mx-auto"
              style={{ maxWidth: '500px' }}
            >
              {error}
            </p>

            <button
              type="button"
              className="btn btn-primary px-4 fw-semibold d-inline-flex align-items-center gap-2"
              onClick={fetchPlacementData}
              style={{
                borderRadius: '9px'
              }}
            >
              <FaRedo size={12} />
              Try Again
            </button>
          </div>
        )}

        {/* =====================================================
            NO TARGET JOBS
        ===================================================== */}

        {!loading &&
          !error &&
          !hasTargetJobs && (
            <div
              className="card border-0 text-center p-5 mb-4"
              style={{
                borderRadius: '16px',
                boxShadow:
                  '0 5px 20px rgba(15, 23, 42, 0.05)'
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '20px',
                  background: '#fff7ed',
                  color: '#ea580c'
                }}
              >
                <FaBriefcase size={32} />
              </div>

              <h4 className="fw-bold text-dark mb-2">
                No Saved Target Jobs
              </h4>

              <p
                className="text-muted small mb-4 mx-auto"
                style={{
                  maxWidth: '540px',
                  lineHeight: '1.7'
                }}
              >
                Add your preferred job roles and skill
                sets under Target Jobs so HireSmart AI
                can find relevant placement opportunities
                for you.
              </p>

              <Link
                to="/student/target-jobs"
                className="btn btn-primary fw-semibold px-4 py-2 mx-auto d-inline-flex align-items-center gap-2"
                style={{
                  borderRadius: '9px'
                }}
              >
                <FaPlusCircle />
                Add Target Jobs
                <FaChevronRight size={11} />
              </Link>
            </div>
          )}

        {/* =====================================================
            NO MATCHING JOBS
        ===================================================== */}

        {!loading &&
          !error &&
          hasTargetJobs &&
          filteredOpportunities.length === 0 && (
            <div
              className="card border-0 text-center p-5 mb-4"
              style={{
                borderRadius: '16px',
                boxShadow:
                  '0 5px 20px rgba(15, 23, 42, 0.05)'
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  background: '#f8fafc',
                  color: '#64748b'
                }}
              >
                <FaSearch size={28} />
              </div>

              <h5 className="fw-bold text-dark mb-2">
                No Opportunities Found
              </h5>

              <p
                className="text-muted small mb-4 mx-auto"
                style={{
                  maxWidth: '520px',
                  lineHeight: '1.7'
                }}
              >
                We couldn't find live job listings for
                <strong>
                  {' '}
                  {getActiveLocationLabel()}
                </strong>{' '}
                matching your current filters.
              </p>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-4 fw-semibold"
                onClick={resetFilters}
                style={{
                  borderRadius: '9px'
                }}
              >
                Show All Opportunities
              </button>
            </div>
          )}

        {/* =====================================================
            OPPORTUNITIES
        ===================================================== */}

        {!loading &&
          !error &&
          filteredOpportunities.length > 0 && (
            <div>

              {/* Results Header */}

              <div className="d-flex flex-wrap justify-content-between align-items-end mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h5 className="fw-bold text-dark mb-0">
                      Matching Opportunities
                    </h5>

                    <span
                      className="badge rounded-pill"
                      style={{
                        background: '#eef2ff',
                        color: '#4338ca',
                        fontSize: '0.75rem'
                      }}
                    >
                      {filteredOpportunities.length}
                    </span>
                  </div>

                  <p className="text-muted small mb-0">
                    Opportunities relevant to your profile
                    and selected filters.
                  </p>
                </div>

                <span className="text-muted small mt-2">
                  Sorted by relevance
                </span>
              </div>

              {/* Job Grid */}

              <div className="row g-4">

                {filteredOpportunities.map((job) => (
                  <div
                    key={job.id}
                    className="col-12 col-xl-6"
                  >
                    <div
                      className="card h-100 border-0 position-relative"
                      style={{
                        borderRadius: '16px',
                        border:
                          '1px solid #e5e7eb',
                        boxShadow:
                          '0 5px 20px rgba(15, 23, 42, 0.055)',
                        overflow: 'hidden',
                        transition:
                          'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          'translateY(-3px)';
                        e.currentTarget.style.boxShadow =
                          '0 14px 30px rgba(15, 23, 42, 0.10)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          'translateY(0)';
                        e.currentTarget.style.boxShadow =
                          '0 5px 20px rgba(15, 23, 42, 0.055)';
                      }}
                    >

                      {/* Top Accent */}

                      <div
                        style={{
                          height: '4px',
                          background:
                            'linear-gradient(90deg, #4f46e5, #6366f1)'
                        }}
                      />

                      <div className="card-body p-4 d-flex flex-column">

                        {/* Job Type + Posted */}

                        <div className="d-flex justify-content-between align-items-start mb-3">

                          <div className="d-flex flex-wrap gap-2">

                            <span
                              className="badge fw-semibold px-3 py-2"
                              style={{
                                background: '#eef2ff',
                                color: '#4338ca',
                                borderRadius: '7px'
                              }}
                            >
                              {job.targetJobRole}
                            </span>

                            {job.jobType && (
                              <span
                                className="badge fw-semibold px-3 py-2"
                                style={{
                                  background: '#f0fdfa',
                                  color: '#0f766e',
                                  borderRadius: '7px'
                                }}
                              >
                                {job.jobType}
                              </span>
                            )}

                          </div>

                          <span
                            className="text-muted small d-flex align-items-center gap-1 ms-2"
                            style={{
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <FaClock size={11} />
                            {job.postedDate}
                          </span>

                        </div>

                        {/* Title */}

                        <h5
                          className="fw-bold text-dark mb-2"
                          style={{
                            fontSize: '1.12rem',
                            lineHeight: '1.4'
                          }}
                        >
                          {job.title}
                        </h5>

                        {/* Company + Location */}

                        <div className="d-flex flex-column gap-2 mb-3">

                          <div className="d-flex align-items-center gap-2 text-secondary small fw-semibold">
                            <span
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: '27px',
                                height: '27px',
                                borderRadius: '7px',
                                background: '#eff6ff',
                                color: '#2563eb'
                              }}
                            >
                              <FaBuilding size={12} />
                            </span>

                            {job.company}
                          </div>

                          <div className="d-flex align-items-center gap-2 text-muted small">
                            <span
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: '27px',
                                height: '27px',
                                borderRadius: '7px',
                                background: '#fef2f2',
                                color: '#dc2626'
                              }}
                            >
                              <FaMapMarkerAlt size={12} />
                            </span>

                            {job.location}
                          </div>

                        </div>

                        {/* Description */}

                        <p
                          className="text-muted small mb-3"
                          style={{
                            lineHeight: '1.7'
                          }}
                        >
                          {job.description}
                        </p>

                        {/* Matching Skills */}

                        {(job.matchingSkills || []).length >
                          0 && (
                          <div className="mb-4">

                            <span
                              className="d-block text-dark small fw-semibold mb-2"
                            >
                              Matching Skills
                            </span>

                            <div className="d-flex flex-wrap gap-2">
                              {(job.matchingSkills || []).map(
                                (skill, idx) => (
                                  <span
                                    key={idx}
                                    className="badge fw-medium"
                                    style={{
                                      background:
                                        '#f0fdf4',
                                      color: '#15803d',
                                      border:
                                        '1px solid #dcfce7',
                                      padding:
                                        '6px 9px',
                                      borderRadius: '7px'
                                    }}
                                  >
                                    <FaCheckCircle
                                      className="me-1"
                                      size={9}
                                    />
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>

                          </div>
                        )}

                        {/* Footer */}

                        <div
                          className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center gap-3"
                        >

                          <div className="text-muted small">
                            <span>Source</span>
                            <strong className="text-dark ms-1">
                              {job.source}
                            </strong>
                          </div>

                          <button
                            type="button"
                            className="btn btn-primary fw-semibold px-3 py-2 d-flex align-items-center gap-2"
                            onClick={() =>
                              handleApplyNow(
                                job.applyUrl,
                                job.title,
                                job.company
                              )
                            }
                            style={{
                              borderRadius: '9px',
                              fontSize: '0.85rem',
                              boxShadow:
                                '0 4px 10px rgba(79, 70, 229, 0.18)'
                            }}
                          >
                            Apply Now
                            <FaExternalLinkAlt size={10} />
                          </button>

                        </div>

                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          )}

      </div>

      {/* Small Spinner Animation */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .form-select:focus {
            border-color: #818cf8 !important;
            box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.12) !important;
          }

          .btn-primary {
            transition: all 0.2s ease;
          }

          .btn-primary:hover {
            transform: translateY(-1px);
          }
        `}
      </style>
    </StudentLayout>
  );
};

export default PlacementOpportunities;