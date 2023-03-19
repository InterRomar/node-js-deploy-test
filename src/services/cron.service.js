const CronJob = require('cron').CronJob;
const dayjs = require('dayjs');

const db = require('../db');

const cleanPasswordsCollectionJob = new CronJob(
  '0 0 * * * *', 
  async () => {
    console.log('START CRON JOB AT: ', dayjs().format('HH:mm:ss'));
    const passwordSnapshot = await db.collection('passwords').get();
    
    if (passwordSnapshot.empty) return;

    const passwordListToDelete = [];

    passwordSnapshot.docs.forEach((item) => {
      const passwordEntry = item.data();
      
      if (dayjs().diff(passwordEntry.createdAt.toDate(), 'minute') >= 1440) { // 24 hours
        passwordListToDelete.push(passwordEntry);
      }
    });

    let deletedPasswordsCounter = 0;
    for (let password of passwordListToDelete) {
      await db.collection('passwords').doc(password.id).delete();
      deletedPasswordsCounter++;
    }

    console.log(`${deletedPasswordsCounter} password have been deleted.`);
    console.log('FINISH CRON JOB AT: ', dayjs().format('HH:mm:ss'));
  }, 
  null, 
  true, 
  'Europe/Moscow'
);

module.exports = {
  cleanPasswordsCollectionJob
}