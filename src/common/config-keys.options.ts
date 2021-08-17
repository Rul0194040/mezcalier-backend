import * as Joi from '@hapi/joi';
import { MorganTypes } from './enum/morganTypes.enum';

export const ConfigKeysOptions: Joi.SchemaMap = {
  GOOGLE_APPLICATION_CREDENTIALS: Joi.string().default(''),
  //any of this settings can be changed in your .env file
  //real environment values have precedence over this and the .env values
  MORGAN_TYPE: Joi.string().default(MorganTypes.COMBINED),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_ROUTE: Joi.string().default('api/v1'),
  API_SWAGGER: Joi.string().default('swagger'), // = /api/v1/swagger

  //jwt
  JWT_SECRET: Joi.string().default('changeme!'),
  JWT_EXPIRATION: Joi.string().default('30d'), //m=minutes, h=hours, d=days, m=months

  //usuarios
  CREATE_USERS: Joi.boolean().default(true),
  FIRST_PASSWORD: Joi.string().default('password'),

  BASE_URL: Joi.string().default('http://localhost:4200'),

  //mysql
  MYSQL_DB: Joi.string().default('mezcalier'),
  MYSQL_HOST: Joi.string().default('localhost'),
  MYSQL_USER: Joi.string().default('mezcalier'),
  MYSQL_PORT: Joi.number().default(3306),
  MYSQL_PASSWORD: Joi.string().default('mysqlpasmezcaliersword'),
  MYSQL_ROOT_PASSWORD: Joi.string().default('nada'),

  //sentry.io
  SENTRY_DSN: Joi.string().default(''),

  //smtp
  SMTP_USER: Joi.string().default(''),
  SMTP_PASSWORD: Joi.string().default(''),
  SMTP_FROM_EMAIL: Joi.string().default(''),
  SMTP_FROM_NAME: Joi.string().default('Mezcalier Mailer'),
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(465),
  SMTP_SECURE: Joi.boolean().default(true),
  SMTP_IGNORE_TLS: Joi.boolean().default(true),
  SEND_USER_EMAILS: Joi.boolean().default(false),

  EMAILS_INBOX: Joi.string().default(''),
  SITE_NAME: Joi.string().default('Mezcalier'),

  //twilio
  TWILIO_NUMBER: Joi.string().default(''),
  TWILIO_ID: Joi.string().default(''),
  TWILIO_KEY: Joi.string().default(''),

  // OAUTH FACEBOOK
  FB_APP_ID: Joi.string().default('123'),
  FB_APP_SECRET: Joi.string().default('123'),

  // OAUTH GOOGLE
  GOOGLE_CLIENT_ID: Joi.string().default('123'),
  GOOGLE_APP_SECRET: Joi.string().default('123'),
};
