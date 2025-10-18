// src/instrument.ts

import * as Sentry from "@sentry/node";
import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("VERIFICAÇÃO DE DEBUG: Sentry DSN lido pelo .env:", process.env.SENTRY_DSN);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: true,
});