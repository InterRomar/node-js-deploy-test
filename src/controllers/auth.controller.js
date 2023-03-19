const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const randomstring = require("randomstring");
const dayjs = require('dayjs');

const config = require('../config');
const db = require('../db');
const emailService = require('../services/email.service');

const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: error.message
    });
  }
};

const initiateAuth = async (req, res) => {
  try {
    const { email } = req.body;
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    // user does not exist
    if (snapshot.empty) {
      const uniqueUserId = uuidv4();
      await usersRef.doc(uniqueUserId).set({
        id: uniqueUserId,
        email,
        plan: null, // Expire Date or null
        role: 'user', 
        createdAt: new Date(),
      });

      return res.status(200).json({
        message: 'New user has been created. Please pay the plan.'
      });
    }
    
    const user = snapshot.docs[0].data();
    // =================================================================
    // check if user has a paid plan 
    // =================================================================
    if (!user.plan || dayjs(user.plan.toDate()).diff(dayjs()) <= 0) {
      return res.status(200).json({
        message: 'Please pay the plan.'
      });
    }

    // =================================================================
    // check if user can create passwords today 
    // =================================================================
    const passwordRef = db.collection('passwords');

    const passwordSnapshot = await passwordRef.where('userId', '==', user.id).get();

    const passwords = [];
    passwordSnapshot.docs.forEach((item) => {
      const passwordEntry = item.data();

      if (dayjs().diff(passwordEntry.createdAt.toDate(), 'minute') <= 1440) { // 24 hours
        passwords.push(passwordEntry);
      }
    });

    // =================================================================
    // This means user can not create a new password today
    // =================================================================
    if (passwords.length >= 3) {
      for (let password of passwords) {
        const updatingPasswordRef = db.collection('passwords').doc(password.id);
        await updatingPasswordRef.update({ isActive: false })
      }
      
      return res.status(403).json({
        message: 'You\'ve used up all your attempts today',
      });
    }

    // =================================================================
    // only if user has attempts 
    // =================================================================
    const randomPassword = randomstring.generate(9);
    const hashPass = await bcrypt.hash(randomPassword, 10);

    const uniquePasswordId = uuidv4();

    await passwordRef.doc(uniquePasswordId).set({
      id: uniquePasswordId,
      userId: user.id,
      hash: hashPass,
      isActive: true,
      createdAt: new Date(),
    });

    await emailService.sendPassword({
      targetEmail: email,
      password: randomPassword,
    });

    res.status(200).json({
      message: `Password was successfully sent to ${email}`,
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const user = snapshot.docs[0].data();

    if (user.role === 'admin') {
      if (password !== config.adminSecret) {
        return res.status(403).json({
          message: 'User doesn\'n have valid passwords',
        });
      }

      const accessToken = jwt.sign(
        { id: user.id },
        config.jwtSecret, 
        { expiresIn: 43200 }
      );
  
      return res.status(200).json({
        accessToken,
      });
    }

    const passwordSnapshot = await db
      .collection('passwords')
      .where('userId', '==', user.id)
      .where('isActive', '==', true)
      .get();

    if (passwordSnapshot.empty) {
      return res.status(404).json({
        message: 'User doesn\'n have valid passwords',
      });
    }
    
    const existingPasswords = [];

    passwordSnapshot.docs.forEach((item) => {
      const passwordEntry = item.data();

      if (dayjs().diff(passwordEntry.createdAt.toDate(), 'minute') <= 1440)  {
        existingPasswords.push(passwordEntry);
      }
    });

    let isPasswordsMatch = false;
    let matchedPasswordEntry;
    for (let i = 0; i < existingPasswords.length; i++) {
      isPasswordsMatch = await bcrypt.compare(password, existingPasswords[i].hash); 

      if (isPasswordsMatch) {
        matchedPasswordEntry  = existingPasswords[i];
        break;
      }
    }

    if (!isPasswordsMatch) {
      return res.status(403).json({
        message: 'Wrong password, try again',
      });
    }

    const matchedPasswordRef = db.collection('passwords').doc(matchedPasswordEntry.id);
    await matchedPasswordRef.update({ isActive: false });

    const accessToken = jwt.sign(
      { id: user.id },
      config.jwtSecret, 
      { expiresIn: 43200 }
    );

    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  initiateAuth,
  checkAuth,
  login,
}