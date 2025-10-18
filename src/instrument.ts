// src/instrument.ts

import dotenv from 'dotenv';
dotenv.config();

import * as Sentry from "@sentry/node";

console.log("VERIFICAÇÃO DE DEBUG: Porta lida pelo .env:", process.env.PORT);
console.log("VERIFICAÇÃO DE DEBUG: Sentry DSN lido pelo .env:", process.env.SENTRY_DSN);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: true,
});