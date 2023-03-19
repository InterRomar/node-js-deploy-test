const express = require('express');

const authRouter = require('./auth.route');
const adminRouter = require('./admin.route');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);

module.exports = router;
