const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, statsController.saveStats);
router.get('/', authMiddleware, statsController.getMonthlyStats);

module.exports = router;
