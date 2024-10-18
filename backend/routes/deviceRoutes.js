const express = require('express');
const { createDevice, listDevices } = require('../controllers/deviceController');
const router = express.Router();

router.post('/', createDevice);
router.get('/', listDevices);

module.exports = router;
