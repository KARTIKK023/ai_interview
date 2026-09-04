const express = require('express');

const router = express.Router();

const {
  sendNotification
} = require('../controllers/notificationController');


// POST /api/notifications/send

router.post(
  '/send',
  sendNotification
);


module.exports = router;