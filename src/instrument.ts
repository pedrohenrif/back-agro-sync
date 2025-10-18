// src/instrument.ts

import * as Sentry from "@sentry/node";
import dotenv from 'dotenv';

dotenv.config();

console.log("VERIFICAÇÃO DE DEBUG: Sentry DSN lido pelo .env:", process.env.SENTRY_DSN);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: true,
});