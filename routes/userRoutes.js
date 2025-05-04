const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

router.get('/profile', auth, getUserProfile);
module.exports = router;
