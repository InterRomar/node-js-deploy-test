const express = require('express');
const cors = require("cors");

require('dotenv').config();

const app = express();

const router = require('./src/routes');
const cronService = require('./src/services/cron.service');
const config = require("./src/config")

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cronService.cleanPasswordsCollectionJob.start();

app.use('/api', router);

app.listen(config.port, () => {
  console.log(`Server is listening on port ${config.port}`);
});


// TODO:
// - Real Firebase account
// - Real Email Service account