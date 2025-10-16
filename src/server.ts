import dotenv from 'dotenv';
dotenv.config();

import * as Sentry from "@sentry/node";
import { expressIntegration } from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

import express from "express";
import cors from "cors";
import router from "./routes/index.js";

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    expressIntegration(),
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

console.log("Sentry DSN lido pelo app:", process.env.SENTRY_DSN);

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000, com Sentry ativado!");
});