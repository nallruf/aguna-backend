var express = require('express');
var router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const courseController = require('../controllers/courseController');
const landingController = require('../controllers/landingController');
const faqController = require('../controllers/faqController');
const eventController = require('../controllers/eventController');
const challengeController = require('../controllers/challengeController');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');
const skillController = require('../controllers/skillController');
 

router.get('/landing/role', courseController.getDataLanding);
router.get('/landing/faq', faqController.getFaq);
router.get('/landing/event', eventController.getEvents);
router.get('/landing/challenge', challengeController.getChallenges);
router.get('/skills', skillController.getSkills);
router.get('/leaderboard', challengeController.getAllLeaderboard);

router.post('/register', authController.register);
router.post('/login', authController.login);
// router.post('/logout', authMiddleware.verifyToken, authController.logout);

module.exports = router;    