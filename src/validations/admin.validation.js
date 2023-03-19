const yup = require('yup')

const updateUserPlanSchema = yup.object({
  // plan: yup.date().required(),
  plan: yup.number().test(
    'correct-plan',
    'The value of Plan can be only 0, 1, or 3',
    (value) => (
      value === 0 || value === 1 || value === 3
    )
  ),
});

module.exports = {
  updateUserPlanSchema,
}
