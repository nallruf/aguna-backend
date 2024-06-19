var express = require('express');
var router = express.Router();

const adminDashboard = require('../controllers/dashboard/admin/dashboardController');
const roleDashboard = require('../controllers/dashboard/admin/roleController');
const eventDashboard = require('../controllers/dashboard/admin/eventController');

const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multer');
const { route } = require('./users');

router.get('/statistic', authMiddleware.verifyToken, adminDashboard.getDataDashboard);

router.get('/role', authMiddleware.verifyToken, roleDashboard.getRole);
router.post('/role', authMiddleware.verifyToken, roleDashboard.createRole);
router.get('/role/:roleId', authMiddleware.verifyToken, roleDashboard.getDetailRole);
router.get('/role/:roleId/form', authMiddleware.verifyToken, roleDashboard.getRoleById);
router.patch('/role/:roleId', authMiddleware.verifyToken, roleDashboard.updateRole);
router.delete('/role/:roleId', authMiddleware.verifyToken, roleDashboard.deleteRole);

router.post('/path/:roleId', authMiddleware.verifyToken, upload.single('image'),  roleDashboard.createPath);
router.get('/path/:pathId', authMiddleware.verifyToken, roleDashboard.getDetailPath);
router.get('/path/:pathId/form', authMiddleware.verifyToken, roleDashboard.getPathById);
router.patch('/path/:pathId', authMiddleware.verifyToken, upload.single('image'), roleDashboard.updatePath);
router.delete('/path/:pathId', authMiddleware.verifyToken, roleDashboard.deletePath);

router.post('/path/focus/:pathId', authMiddleware.verifyToken, upload.single('image'),roleDashboard.createPathFocus);
router.get('/path/focus/:pathFocusId', authMiddleware.verifyToken, roleDashboard.getDetailPathFocus);
router.get('/path/focus/:pathFocusId/form', authMiddleware.verifyToken, roleDashboard.getPathFocusById);
router.patch('/path/focus/:pathFocusId', authMiddleware.verifyToken, upload.single('image'), roleDashboard.updatePathFocus);
router.delete('/path/focus/:pathFocusId', authMiddleware.verifyToken, roleDashboard.deletePathFocus);

router.post('/course/:pathFocusId', authMiddleware.verifyToken, upload.single('image') ,roleDashboard.createCourse);
router.get('/course/:courseId', authMiddleware.verifyToken, roleDashboard.getDetailCourse);
router.get('/course/:courseId/form', authMiddleware.verifyToken, roleDashboard.getCourseById);
router.patch('/course/:courseId', authMiddleware.verifyToken, upload.single('image'),roleDashboard.updateCourse);
router.delete('/course/:courseId', authMiddleware.verifyToken, roleDashboard.deleteCourse);

router.post('/course/material/:courseId', authMiddleware.verifyToken, roleDashboard.createMaterial);
router.get('/course/material/:materialId', authMiddleware.verifyToken, roleDashboard.getMaterialById);
router.patch('/course/material/:materialId', authMiddleware.verifyToken, roleDashboard.updateMaterial);
router.delete('/course/material/:materialId', authMiddleware.verifyToken, roleDashboard.deleteMaterial);

router.post('/test/:roleId', authMiddleware.verifyToken, roleDashboard.createTest);
router.get('/test/:testId', authMiddleware.verifyToken, roleDashboard.getDetailTest);
router.get('/test/:testId/form', authMiddleware.verifyToken, roleDashboard.getTestById);
router.patch('/test/:testId', authMiddleware.verifyToken, roleDashboard.updateTest);
router.delete('/test/:testId', authMiddleware.verifyToken, roleDashboard.deleteTest);

router.post('/test/question/:testId', authMiddleware.verifyToken, roleDashboard.createQuestion);
router.get('/test/question/:questionId/form', authMiddleware.verifyToken, roleDashboard.getQuestionById);
router.patch('/test/question/:questionId', authMiddleware.verifyToken, roleDashboard.updateQuestion);
router.delete('/test/question/:questionId', authMiddleware.verifyToken, roleDashboard.deleteQuestion);

router.get('/mentor', authMiddleware.verifyToken, roleDashboard.getMentor);

router.get('/event', authMiddleware.verifyToken, eventDashboard.getEvent);
router.post('/event', authMiddleware.verifyToken, upload.single('image'), eventDashboard.createEvent);
router.get('/event/:eventId', authMiddleware.verifyToken, eventDashboard.getDetailEvent);
router.get('/event/:eventId/form', authMiddleware.verifyToken, eventDashboard.getEventById);
router.patch('/event/:eventId', authMiddleware.verifyToken, upload.single('image'), eventDashboard.updateEvent);
router.delete('/event/:eventId', authMiddleware.verifyToken, eventDashboard.deleteEvent);

router.get('/speaker', authMiddleware.verifyToken, eventDashboard.getSpeaker);
router.post('/speaker', authMiddleware.verifyToken, upload.single('image'), eventDashboard.createSpeaker);
router.get('/speaker/:speakerId/form', authMiddleware.verifyToken, eventDashboard.getSpeakerById);
router.patch('/speaker/:speakerId', authMiddleware.verifyToken, upload.single('image'), eventDashboard.updateSpeaker);
router.delete('/speaker/:speakerId', authMiddleware.verifyToken, eventDashboard.deleteSpeaker);

router.get('/event/speaker/:eventId', authMiddleware.verifyToken, eventDashboard.getEventSpeaker);
router.post('/event/speaker/:eventId', authMiddleware.verifyToken, eventDashboard.addEventSpeaker);
router.delete('/event/speaker/:eventId/:speakerId', authMiddleware.verifyToken, eventDashboard.deleteEventSpeaker);



module.exports = router;