const dayjs = require('dayjs');

const db = require('../db');

const checkAdminAuth = async (req, res) => (
  res.status(200).json(req.user)
);

const getUserList = async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.get();

    if (userSnapshot.empty) {
      return res.status(200).json({
        items: []
      });
    }

    const list = [];
    
    userSnapshot.forEach(item => {
      const user = item.data();

      if (user.role !== 'admin') {
        list.push({
          ...user,
          createdAt: user.createdAt.toDate(),
          plan: user.plan?.toDate() || null,
        });
      }
    });

    return res.status(200).json({
      items: list,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
};

const updateUserPlan = async (req, res) => {
  try {
    if (!req.params.userId) {
      return res.status(400).json({
        message: 'User ID is required path param.',
      });
    }

    const usersRef = db.collection('users').doc(req.params.userId);

    let planExpireDate;

    switch (req.body.plan) {
      case 1:
        planExpireDate = dayjs().add(1, 'month');
        break;
      case 3:
        planExpireDate = dayjs().add(3, 'month');
        break;
    
      default:
        planExpireDate = null;
        break;
    }

    await db.runTransaction(async (t) => {
      
      t.update(usersRef, { plan: planExpireDate ? planExpireDate.toDate() : planExpireDate});
    });

    return res.status(200).json({
      message: 'Plan has been updated successfully.',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  checkAdminAuth,
  getUserList,
  updateUserPlan
};
