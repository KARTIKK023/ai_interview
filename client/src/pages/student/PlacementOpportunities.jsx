import React, { useState, useEffect } from 'react';
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
  FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const PlacementOpportunities = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetJobs, setTargetJobs] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [hasTargetJobs, setHasTargetJobs] = useState(true);

  // Target Job Filter State
  const [selectedTargetJob, setSelectedTargetJob] = useState('ALL');

  // Cascading Location Filter State (Country ISO -> State ISO -> City Name)
  const [selectedCountryIso, setSelectedCountryIso] = useState('IN'); // Default to India (IN)
  const [selectedStateIso, setSelectedStateIso] = useState('ALL');
  const [selectedCityName, setSelectedCityName] = useState('ALL');

  // Dynamic Location Lists & Loading States
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // 1. Initial Load: Fetch Countries
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

  // 2. When Country changes -> Fetch States for selected country
  useEffect(() => {
    if (!selectedCountryIso || selectedCountryIso === 'ALL') {
      setStatesList([]);
      setCitiesList([]);
      setSelectedStateIso('ALL');
      setSelectedCityName('ALL');
      return;
    }

    const loadStates = async () => {
      try {
        setLoadingStates(true);
        const states = await fetchStatesByCountry(selectedCountryIso);
        setStatesList(states || []);
      } catch (err) {
        console.error(`Failed to load states for ${selectedCountryIso}:`, err);
        setStatesList([]);
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, [selectedCountryIso]);

  // 3. When State changes -> Fetch Cities for selected state
  useEffect(() => {
    // Clear old cities immediately when state or country changes
    setCitiesList([]);
    setSelectedCityName('ALL');

    if (!selectedCountryIso || selectedCountryIso === 'ALL' || !selectedStateIso || selectedStateIso === 'ALL') {
      return;
    }

    const loadCities = async () => {
      try {
        setLoadingCities(true);
        console.log(`[FE PLACEMENT PAGE] Triggering City API request for Country ISO: "${selectedCountryIso}", State ISO: "${selectedStateIso}"`);
        const cities = await fetchCitiesByState(selectedCountryIso, selectedStateIso);
        console.log(`[FE PLACEMENT PAGE] Received ${cities ? cities.length : 0} cities for State ISO: "${selectedStateIso}"`);
        setCitiesList(cities || []);
      } catch (err) {
        console.error(`[FE PLACEMENT PAGE] Failed to load cities for ${selectedCountryIso}/${selectedStateIso}:`, err);
        setCitiesList([]);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [selectedCountryIso, selectedStateIso]);

  // 4. Fetch Placement Jobs whenever filters change
  useEffect(() => {
    fetchPlacementData();
  }, [selectedTargetJob, selectedCountryIso, selectedStateIso, selectedCityName]);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      setError('');

      // Find selected country/state display names for API query parameter filtering
      const selectedCountryObj = countriesList.find(c => c.iso2 === selectedCountryIso);
      const selectedStateObj = statesList.find(s => s.iso2 === selectedStateIso);

      const countryParam = selectedCountryIso === 'ALL' ? 'ALL' : (selectedCountryObj?.name || selectedCountryIso);
      const stateParam = selectedStateIso === 'ALL' ? 'ALL' : (selectedStateObj?.name || selectedStateIso);
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
        setError(res.data.message || 'Failed to load placement opportunities.');
      }
    } catch (err) {
      console.error('Error loading placement opportunities:', err);
      setError(err.response?.data?.message || 'Server error while fetching job opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Event Handlers for Cascading Selection
  const handleCountryChange = (e) => {
    const newCountryIso = e.target.value;
    setSelectedCountryIso(newCountryIso);
    setSelectedStateIso('ALL'); // Reset state selection
    setSelectedCityName('ALL'); // Reset city selection
  };

  const handleStateChange = (e) => {
    const newStateIso = e.target.value;
    setSelectedStateIso(newStateIso);
    setSelectedCityName('ALL'); // Reset city selection
  };

  const handleCityChange = (e) => {
    setSelectedCityName(e.target.value);
  };

  // Client-Side Dynamic Location Match Helper
  const isLocationMatch = (jobLocationRaw) => {
    const loc = (jobLocationRaw || '').toLowerCase().trim();
    if (!loc) return false;

    const isCountryActive = selectedCountryIso && selectedCountryIso !== 'ALL';
    const isStateActive = selectedStateIso && selectedStateIso !== 'ALL';
    const isCityActive = selectedCityName && selectedCityName !== 'ALL';

    if (!isCountryActive && !isStateActive && !isCityActive) {
      return true;
    }

    // 1. Country Matching
    let matchesCountry = true;
    if (isCountryActive) {
      const countryObj = countriesList.find(c => c.iso2 === selectedCountryIso);
      const countryName = countryObj ? countryObj.name.toLowerCase() : selectedCountryIso.toLowerCase();

      matchesCountry = loc.includes(countryName) || loc.includes(selectedCountryIso.toLowerCase());
      if (selectedCountryIso === 'IN') {
        matchesCountry = matchesCountry || loc.includes('india') || loc.includes('delhi') || loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('mumbai') || loc.includes('hyderabad') || loc.includes('pune') || loc.includes('chennai') || loc.includes('gurgaon') || loc.includes('noida');
      } else if (selectedCountryIso === 'US') {
        matchesCountry = matchesCountry || loc.includes('us') || loc.includes('usa') || loc.includes('united states');
      }
    }

    if (!matchesCountry) return false;

    // 2. City + Country Match Rule: If City is selected and matches, show job even if State string is omitted in raw job location (e.g. "Mumbai, India")
    if (isCityActive) {
      const matchesCity = loc.includes(selectedCityName.toLowerCase());
      if (!matchesCity) return false;

      // If State IS present in raw location string, validate State
      if (isStateActive) {
        const stateObj = statesList.find(s => s.iso2 === selectedStateIso);
        const stateName = stateObj ? stateObj.name.toLowerCase() : selectedStateIso.toLowerCase();
        if (loc.includes(stateName) || loc.includes(selectedStateIso.toLowerCase())) {
          return true;
        }
      }
      // City + Country match is valid even if state text is missing from location string
      return true;
    }

    // 3. Country + State Match Rule (when City is 'ALL')
    if (isStateActive) {
      const stateObj = statesList.find(s => s.iso2 === selectedStateIso);
      const stateName = stateObj ? stateObj.name.toLowerCase() : selectedStateIso.toLowerCase();
      if (loc.includes(stateName) || loc.includes(selectedStateIso.toLowerCase())) {
        return true;
      }
      // Accept matching city in state
      return citiesList.some(city => loc.includes(city.name.toLowerCase()));
    }

    return true;
  };

  // Filter Opportunities by Target Job & Cascading Location
  const filteredOpportunities = opportunities.filter((job) => {
    if (selectedTargetJob !== 'ALL' && job.targetJobRole !== selectedTargetJob) {
      return false;
    }
    if (!isLocationMatch(job.location)) {
      return false;
    }
    return true;
  });

  const handleApplyNow = (applyUrl, jobTitle, company) => {
    if (!applyUrl) {
      toast.error('Application link unavailable for this listing.');
      return;
    }
    toast.success(`Opening application page for ${company}...`);
    window.open(applyUrl, '_blank', 'noopener,noreferrer');
  };

  const getActiveLocationLabel = () => {
    const cObj = countriesList.find(c => c.iso2 === selectedCountryIso);
    const sObj = statesList.find(s => s.iso2 === selectedStateIso);

    const parts = [];
    if (selectedCityName && selectedCityName !== 'ALL') parts.push(selectedCityName);
    if (sObj) parts.push(sObj.name);
    if (cObj) parts.push(cObj.name);

    return parts.length > 0 ? parts.join(', ') : 'All Locations';
  };

  return (
    <StudentLayout>
      <div className="container-fluid py-2">
        {/* HERO BANNER */}
        <div
          className="p-3.5 p-md-4 mb-4 text-white position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(130deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
            borderRadius: '15px',
            boxShadow: '0 8px 25px -8px rgba(49, 46, 129, 0.4)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}
        >
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <span className="badge bg-primary bg-opacity-30 border border-primary border-opacity-40 px-2.5 py-1 rounded-pill" style={{ color: '#93C5FD', fontSize: '0.725rem' }}>
                  <FaBriefcase className="me-1" style={{ fontSize: '0.7rem' }} /> Live Placements & Internships
                </span>
                <span className="badge bg-success bg-opacity-30 border border-success border-opacity-40 px-2.5 py-1 rounded-pill" style={{ color: '#6EE7B7', fontSize: '0.675rem' }}>
                  <FaCheckCircle className="me-1" style={{ fontSize: '0.675rem' }} /> Verified Apply Links
                </span>
              </div>
              <h3 className="fw-extrabold mb-1 text-white">Placement Opportunities</h3>
              <p className="text-white-50 mb-0 small leading-relaxed">
                Explore real job and internship opportunities personalized strictly to your saved Target Jobs and core skill profile.
              </p>
            </div>
            <div className="col-lg-4 text-center text-lg-end mt-3 mt-lg-0">
              <div className="d-inline-flex p-2.5 rounded-circle bg-white bg-opacity-10 border border-white border-opacity-20 shadow-sm">
                <FaBriefcase size={38} className="text-info" />
              </div>
            </div>
          </div>
        </div>

        {/* TARGET JOB & DYNAMIC CASCADING LOCATION (TARGET JOB -> COUNTRY -> STATE -> CITY) TOOLBAR */}
        <div className="card card-custom p-4 mb-4 border-0 shadow-sm bg-white">
          <div className="row align-items-center g-3">
            <div className="col-xl-3 col-lg-12">
              <h6 className="fw-bold text-dark mb-1">Filter Opportunities</h6>
              <p className="text-muted small mb-0">Target Job → Country → State → City</p>
            </div>
            <div className="col-xl-9 col-lg-12">
              <div className="row g-2">
                {/* 1. Target Job Dropdown */}
                <div className="col-12 col-sm-6 col-md-3">
                  <select
                    className="form-select bg-light fw-semibold text-dark w-100"
                    value={selectedTargetJob}
                    onChange={(e) => setSelectedTargetJob(e.target.value)}
                  >
                    <option value="ALL">All Target Jobs ({targetJobs.length})</option>
                    {targetJobs.map((tj) => (
                      <option key={tj._id} value={tj.role}>
                        {tj.role} {tj.company ? `(${tj.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Country Dropdown */}
                <div className="col-12 col-sm-6 col-md-3 position-relative">
                  <select
                    className="form-select bg-light fw-semibold text-dark w-100"
                    value={selectedCountryIso}
                    onChange={handleCountryChange}
                    disabled={loadingCountries}
                  >
                    <option value="ALL">All Countries</option>
                    {countriesList.map((c) => (
                      <option key={c.iso2} value={c.iso2}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {loadingCountries && (
                    <FaSpinner className="spinner-border-sm text-primary position-absolute end-0 top-50 translate-middle-y me-3" />
                  )}
                </div>

                {/* 3. State Dropdown (Cascading: Disabled until Country selected) */}
                <div className="col-12 col-sm-6 col-md-3 position-relative">
                  <select
                    className="form-select bg-light fw-semibold text-dark w-100"
                    value={selectedStateIso}
                    disabled={selectedCountryIso === 'ALL' || !selectedCountryIso || loadingStates}
                    onChange={handleStateChange}
                  >
                    <option value="ALL">
                      {selectedCountryIso === 'ALL' || !selectedCountryIso ? 'Select State' : 'All States'}
                    </option>
                    {statesList.map((s) => (
                      <option key={s.iso2} value={s.iso2}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {loadingStates && (
                    <FaSpinner className="spinner-border-sm text-primary position-absolute end-0 top-50 translate-middle-y me-3" />
                  )}
                </div>

                {/* 4. City Dropdown (Cascading: Disabled until State selected) */}
                <div className="col-12 col-sm-6 col-md-3 position-relative">
                  <select
                    className="form-select bg-light fw-semibold text-dark w-100"
                    value={selectedCityName}
                    disabled={selectedStateIso === 'ALL' || !selectedStateIso || loadingCities || (citiesList.length === 0 && !loadingCities)}
                    onChange={handleCityChange}
                  >
                    {loadingCities ? (
                      <option value="ALL">Loading cities...</option>
                    ) : selectedStateIso === 'ALL' || !selectedStateIso ? (
                      <option value="ALL">Select City</option>
                    ) : citiesList.length === 0 ? (
                      <option value="ALL">No cities found</option>
                    ) : (
                      <>
                        <option value="ALL">All Cities ({citiesList.length})</option>
                        {citiesList.map((city) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {loadingCities && (
                    <FaSpinner className="spinner-border-sm text-primary position-absolute end-0 top-50 translate-middle-y me-3" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Fetching live opportunities...</span>
            </div>
            <h5 className="fw-bold text-dark">Matching Real Job Opportunities...</h5>
            <p className="text-muted small mb-0">Analyzing your saved Target Jobs and skill requirements across live feeds.</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="card card-custom p-5 text-center bg-white border-0 shadow-sm mb-4">
            <div className="text-danger mb-3">
              <FaExclamationCircle size={48} />
            </div>
            <h5 className="fw-bold text-dark mb-2">Unable to Fetch Opportunities</h5>
            <p className="text-muted small mb-4">{error}</p>
            <button className="btn btn-primary btn-sm px-4 mx-auto fw-bold d-flex align-items-center gap-2" onClick={fetchPlacementData}>
              <FaRedo /> Try Again
            </button>
          </div>
        )}

        {/* NO TARGET JOBS SAVED STATE */}
        {!loading && !error && !hasTargetJobs && (
          <div className="card card-custom p-5 text-center bg-white border-0 shadow-sm mb-4">
            <div className="text-warning mb-3">
              <FaBriefcase size={54} />
            </div>
            <h4 className="fw-bold text-dark mb-2">No Saved Target Jobs Found</h4>
            <p className="text-muted small mb-4 max-w-md mx-auto">
              You haven't set up any Target Jobs yet! Save your preferred job roles and skill sets under Target Jobs so HireSmart AI can match live placement opportunities for you.
            </p>
            <Link to="/student/target-jobs" className="btn btn-primary fw-bold px-4 py-2 mx-auto d-flex align-items-center gap-2">
              <FaPlusCircle /> Add Target Jobs Now
            </Link>
          </div>
        )}

        {/* NO MATCHING JOBS FILTERED STATE */}
        {!loading && !error && hasTargetJobs && filteredOpportunities.length === 0 && (
          <div className="card card-custom p-5 text-center bg-white border-0 shadow-sm mb-4">
            <div className="text-muted mb-3">
              <FaBriefcase size={48} />
            </div>
            <h5 className="fw-bold text-dark mb-2">
              No Opportunities Found for {getActiveLocationLabel()}
            </h5>
            <p className="text-muted small mb-3">
              No live job listings explicitly matched your active location selection ({getActiveLocationLabel()}) for your selected Target Job.
            </p>
            <button
              className="btn btn-outline-secondary btn-sm px-3 mx-auto fw-semibold"
              onClick={() => {
                setSelectedTargetJob('ALL');
                setSelectedCountryIso('ALL');
                setSelectedStateIso('ALL');
                setSelectedCityName('ALL');
              }}
            >
              Show All Locations
            </button>
          </div>
        )}

        {/* OPPORTUNITIES LIST GRID */}
        {!loading && !error && filteredOpportunities.length > 0 && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaBriefcase className="text-primary" /> Matching Placement Opportunities ({filteredOpportunities.length})
              </h5>
              <span className="text-muted small">Sorted by skill & role relevance</span>
            </div>

            <div className="row g-4">
              {filteredOpportunities.map((job) => (
                <div key={job.id} className="col-lg-6">
                  <div
                    className="card card-custom p-4 border-0 shadow-sm h-100 position-relative transition-all"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                      borderLeft: '5px solid #4F46E5'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold me-2 px-2.5 py-1">
                          {job.targetJobRole}
                        </span>
                        <span className="badge bg-info bg-opacity-10 text-info fw-semibold px-2.5 py-1">
                          {job.jobType}
                        </span>
                      </div>
                      <span className="text-muted small d-flex align-items-center gap-1">
                        <FaClock size={12} /> {job.postedDate}
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-1">{job.title}</h5>
                    
                    <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-3">
                      <span className="d-flex align-items-center gap-1 fw-semibold text-secondary">
                        <FaBuilding className="text-primary" /> {job.company}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <FaMapMarkerAlt className="text-danger" /> {job.location}
                      </span>
                    </div>

                    <p className="text-muted small mb-3 leading-relaxed">{job.description}</p>

                    {/* MATCHING SKILLS BADGES */}
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1.5 font-semibold">Matching Competencies:</span>
                      <div className="d-flex flex-wrap gap-1.5">
                        {(job.matchingSkills || []).map((skill, idx) => (
                          <span key={idx} className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1">
                            <FaCheckCircle className="me-1" size={10} /> {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* APPLY NOW BUTTON */}
                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Source: <strong>{job.source}</strong></span>
                      <button
                        className="btn btn-primary btn-sm fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                        onClick={() => handleApplyNow(job.applyUrl, job.title, job.company)}
                      >
                        Apply Now <FaExternalLinkAlt size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default PlacementOpportunities;
