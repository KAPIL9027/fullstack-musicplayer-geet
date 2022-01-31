
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.geetSchema = Joi.object(
    {
      geet: Joi.object(
          {
              songName: Joi.string().required().escapeHTML(),
              duration: Joi.string().required().escapeHTML(),
              artist: Joi.string().required().escapeHTML()
          }
      )
    }
);

module.exports.userSchema = Joi.object(
    {
        username: Joi.string().required().escapeHTML(),
        email: Joi.string().required().escapeHTML(),
        password: Joi.string().required().escapeHTML()
    }
);