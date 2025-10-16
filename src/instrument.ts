// src/instrument.ts

import * as Sentry from "@sentry/node";
import dotenv from 'dotenv';

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});