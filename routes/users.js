var express = require('express');
var router = express.Router();
const dashboardUser = require('../controllers/dashboard/user/dashboardController');
const courseUser = require('../controllers/dashboard/user/courseController');
const challengeUser = require('../controllers/dashboard/user/challengeController');
const eventUser = require('../controllers/dashboard/user/eventController');
const transactionUser = require('../controllers/dashboard/user/transactionController')
const profile = require('../controllers/dashboard/user/userController')


const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multer');

router.get('/statistic', authMiddleware.verifyToken, dashboardUser.getDataDashboard);
router.get('/finishcourse', authMiddleware.verifyToken, courseUser.getFinishCourse);
router.get('/progrescourse', authMiddleware.verifyToken, courseUser.getInProgressCourse);
router.get('/course/:userCourseId', authMiddleware.verifyToken, courseUser.getCourseMaterial);

router.post('/setprogress', authMiddleware.verifyToken, courseUser.saveProgress);
router.post('/settestimoni', authMiddleware.verifyToken, courseUser.giveTestimoni);

router.get('/event/future', authMiddleware.verifyToken, eventUser.getFutureEvent);
router.get('/event/finish', authMiddleware.verifyToken, eventUser.getFinishEvent);

router.get('/challenge/statistic', authMiddleware.verifyToken, challengeUser.getStatistic);
router.get('/challenge/history', authMiddleware.verifyToken, challengeUser.getHistory);

router.get('/transaction', authMiddleware.verifyToken, transactionUser.getTransaction)

router.post('/profile/update', authMiddleware.verifyToken, profile.updateProfile)
router.get('/profile', authMiddleware.verifyToken, profile.getProfile)

module.exports = router;
