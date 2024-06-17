var express = require('express');
var router = express.Router();

const adminDashboard = require('../controllers/dashboard/admin/dashboardController');
const roleDashboard = require('../controllers/dashboard/admin/roleController');

const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multer');

router.get('/statistic', authMiddleware.verifyToken, adminDashboard.getDataDashboard);
router.get('/role', authMiddleware.verifyToken, roleDashboard.getRole);
router.post('/role', authMiddleware.verifyToken, roleDashboard.createRole);
router.get('/role/:roleId', authMiddleware.verifyToken, roleDashboard.getDetailRole);

module.exports = router;