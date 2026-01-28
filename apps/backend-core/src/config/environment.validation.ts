import * as joi from "joi";

export const validationSchema = joi.object({
  NODE_ENV: joi
    .string()
    .valid("development", "production", "test")
    .default("development"),
  DATABASE_URL: joi.string().uri().required(),
  JWT_SECRET: joi.string().min(32).required(),
  SERVICE_TOKEN: joi.string().min(32).required(),
  GEMINI_API_KEY: joi.string().optional(),
  PORT: joi.number().default(3001),
});
