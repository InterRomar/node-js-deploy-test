const axios = require('axios');

const config = require('../config');

const sendPassword = ({ targetEmail, password }) => {
  const payload = {
    service_id: config.mailServiceId,
    template_id:  config.mailTemplateId,
    user_id: config.mailUserId,
    accessToken: config.mailAccessToken,
    template_params: {
        to_email: targetEmail,
        password
    }
  };
  
  return axios.post(config.mailApiUrl, payload);
};

module.exports = {
  sendPassword,
}