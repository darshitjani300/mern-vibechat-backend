import Joi from "joi";

interface IRegister {
  username: string;
  email: string;
  password: string;
}

interface ILogin {
  email: string;
  password: string;
}

const registerSchema = Joi.object<IRegister>({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/)
    .required(),
}).messages({
  "string.empty": "Password is required",
  "string.pattern.base":
    "Password must be at least 8 chars, include uppercase, lowercase, a number, and a special symbol",
});

const loginSchema = Joi.object<ILogin>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export { registerSchema, loginSchema };
