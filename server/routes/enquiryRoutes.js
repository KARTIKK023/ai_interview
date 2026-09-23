const express = require("express");
const router = express.Router();

const { sendEnquiry } = require("../controllers/enquirycontroller");


router.post("/", sendEnquiry);

module.exports = router;