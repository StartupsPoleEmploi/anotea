const Joi = require('joi');

const arrayAsString = () => {
    return Joi.extend(joi => ({
        type: 'arrayAsString',
        base: joi.array(),
        // eslint-disable-next-line no-unused-vars
        coerce: (value, helpers) => {
            if (typeof value === 'string' && value.split) {
                return { value: value.split(',') };
            }
            return { value };
        },
    })).arrayAsString();
};

const idSchema = Joi.object({ id: Joi.string().required() });
const tokenSchema = Joi.object({
    token: Joi.string().required(),
});
const passwordSchema = Joi.object({
    password: Joi.string().required(),
});
const loginSchema = Joi.object({
    identifiant: Joi.string().lowercase().required(),
    password: Joi.string().required(),
});
const checkLoginSchema = Joi.object({
    access_token: Joi.string().required(),
    origin: Joi.string(),
});
const identifiantSchema = Joi.object({
    identifiant: Joi.string().required(),
});
const resetPasswordSchema = Joi.object({
    password: Joi.string().required(),
    token: Joi.string().required(),
});
const changePasswordSchema = Joi.object({
    password: Joi.string().required(),
    token: Joi.string().required(),
});
const updatePassowrd = Joi.object({
    current: Joi.string().required(),
    password: Joi.string().required(),
});

module.exports = {
    arrayAsString,
    arrayOf: (item) => arrayAsString().items(item).single(),
    idValidator: () => Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide'),
    checkSiret: () => Joi.string().min(9).max(15),
    idSchema,
    tokenSchema,
    passwordSchema,
    loginSchema,
    checkLoginSchema,
    identifiantSchema,
    resetPasswordSchema,
    changePasswordSchema,
    updatePassowrd,
};
