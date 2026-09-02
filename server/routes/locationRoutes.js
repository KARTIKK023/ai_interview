const express = require('express');
const router = express.Router();
const { getCountries, getStates, getCities } = require('../controllers/locationController');

// Public Location APIs for cascading dropdowns
router.get('/countries', getCountries);
router.get('/countries/:countryIso/states', getStates);
router.get('/countries/:countryIso/states/:stateIso/cities', getCities);

module.exports = router;
