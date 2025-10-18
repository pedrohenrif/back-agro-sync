// src/server.ts

import "./instrument.js"; 

import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import router from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);

Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}, com Sentry ativado!`);
});