const express = require('express');

const router = express.Router();

const {
  sendNotification
} = require('../controllers/notificationController');

const {
  sendScoreBasedNotification
} = require('../controllers/notificationController');


// POST /api/notifications/send

router.post(
  '/send',
  sendNotification
);

router.post(
  '/send-score-notification',
  sendScoreBasedNotification
);


module.exports = router;