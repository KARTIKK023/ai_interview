const express = require("express");
const multer = require("multer");
const router = express.Router();

const { sendEnquiry } = require("../controllers/enquirycontroller");


const parseEnquiryForm = multer().none();

router.post("/", parseEnquiryForm, sendEnquiry);

module.exports = router;