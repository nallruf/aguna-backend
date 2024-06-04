var express = require('express');
var router = express.Router();
const userController = require('../controllers/usersController');

/* GET users listing. */
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

module.exports = router;
