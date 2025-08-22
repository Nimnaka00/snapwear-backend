// middlewares/validate.js
const { validationResult } = require("express-validator");

module.exports = function validate(rules = []) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      next();
    },
  ];
};
