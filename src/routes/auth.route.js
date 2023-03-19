const express = require('express');

const isAuth = require("../middlewares/isAuth");
const validationMiddleware = require("../middlewares/validationMiddleware");
const userValidation = require('../validations/user.validation');
const authController = require("../controllers/auth.controller");

const router = express.Router()

router.post(
  '/initiate-auth',
  validationMiddleware(userValidation.initiateAuthSchema),
  authController.initiateAuth
);

router.post(
  '/login',
  validationMiddleware(userValidation.loginSchema),
  authController.login
);

router.get('/me', isAuth, authController.checkAuth);

module.exports = router


// user send his email to the /initiate-auth endpoint
// check if user exists 
// if user doesn't exist - we're  creating user
// +++ send response with a message "You need to pay for account"

// Check if user has paid plan
// if user doesn't have paid plan - send 200 response with a message "You need to pay for account"
// check if user is able to login today (sent less than 3 passwords today)
// if so, create random pass, and save hash to the DB (expiresIn = 24h)§
// !!! if attempt #4 - deintegrate all user's passwords and send 403 response
// send password to the user's email
// then user can login using his email and pass from email box
// if everything is ok => send accessToken to user
// Done 

// johhservice17@gmail.com 
// John123$