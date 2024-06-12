var express = require('express');
var router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const courseController = require('../controllers/courseController');
const challengeController = require('../controllers/challengeController');
const eventController = require('../controllers/eventController');
const transactionController = require('../controllers/transactionController');
const toolsController = require('../controllers/toolsController');

const { upload } = require('../middlewares/multer');
const { route } = require('.');
// const { route } = require('.');
 

 
router.post('/logout', authMiddleware.verifyToken ,authController.logout);

router.get('/role/:id', authMiddleware.verifyToken, courseController.getRoleById);
router.get('/path/:id', authMiddleware.verifyToken, courseController.getPathById);
router.get('/path/focus/:pathFocusId', authMiddleware.verifyToken, courseController.getCoursesByPathFocusId);
router.get('/path/focus/mentor/:pathFocusId', authMiddleware.verifyToken, courseController.getMentorsByPathFocusId);
router.get('/course/:courseId', authMiddleware.verifyToken, courseController.getCourseDetails);
router.get('/course/mentor/:courseId', authMiddleware.verifyToken, courseController.getMentorDetailsByCourseId);

router.get('/cek/test/:roleId', authMiddleware.verifyToken, courseController.checkTestForRole);
router.get('/test/detail/:testId', authMiddleware.verifyToken, courseController.getTestDetails);
router.get('/test/start/:testId', authMiddleware.verifyToken, courseController.getTestQuestions);


router.get('/event/:id', authMiddleware.verifyToken ,eventController.getEventById);

router.get('/challenge/:id', authMiddleware.verifyToken, challengeController.getChallengeById);
router.post('/challenge/:id', authMiddleware.verifyToken, challengeController.submitChallenge);

router.post('/cekpromo', authMiddleware.verifyToken, transactionController.checkPromo);
router.get('/transaction/course/:courseId', authMiddleware.verifyToken, transactionController.getCourseTransaction);
router.post('/transaction/course/:courseId', authMiddleware.verifyToken, transactionController.createCourseTransaction);
router.get('/payment/:transactionId', authMiddleware.verifyToken, transactionController.getPaymentDetails);
router.post('/payment/:transactionId', authMiddleware.verifyToken, upload.single('image'), transactionController.uploadPayment);

router.post('/tools', upload.single('image'), toolsController.createTools);



module.exports = router;