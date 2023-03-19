const jwt = require('jsonwebtoken');

const config = require('../config');
const db = require('../db');

const isAuth = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
  }

  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ message: 'Provide authorization token!'});
  }
  try {
    const token = authorizationHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'You are not authorized!'});
    }

    const decodedData = jwt.verify(token, config.jwtSecret);

    const usersRef = db.collection('users');
    const snapshot = await usersRef.doc(decodedData.id).get();
    req.user = snapshot.data();

    next();
  } catch(error) {
    res.status(401).json({ message: error.message });
  }
}

module.exports = isAuth;