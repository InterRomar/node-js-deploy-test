const yup = require('yup')

const initiateAuthSchema = yup.object({
  email: yup.string().email().required(),
});

const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

module.exports = {
  initiateAuthSchema,
  loginSchema,
}
