module.exports = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  adminSecret: process.env.ADMIN_SECRET,
  mailServiceId: process.env.MAIL_SERVICE_ID,
  mailTemplateId: process.env.MAIL_TEMPLATE_ID,
  mailUserId: process.env.MAIL_USER_ID,
  mailAccessToken: process.env.MAIL_ACCESS_TOKEN,
  mailApiUrl: process.env.MAIL_API_URL
}