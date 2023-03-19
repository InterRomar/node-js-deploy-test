const express = require('express');

const isAdmin = require("../middlewares/isAdmin");
const validationMiddleware = require("../middlewares/validationMiddleware");
const adminValidation = require('../validations/admin.validation');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.get('/me', isAdmin, adminController.checkAdminAuth);

router.get('/users', isAdmin, adminController.getUserList);

router.patch(
  '/users/:userId/plan',
  validationMiddleware(adminValidation.updateUserPlanSchema),
  isAdmin, 
  adminController.updateUserPlan
);

module.exports = router;