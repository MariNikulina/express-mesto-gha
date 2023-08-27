const { celebrate, Joi } = require("celebrate");
const { REGEX } = require("../utils/constants");

const validationSchemaSignup = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(REGEX),
  }),
});

const validationSchemaSignIn = celebrate({
  body: Joi.object()
    .keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    })
    .unknown(true),
});

module.exports = { validationSchemaSignIn, validationSchemaSignup };
