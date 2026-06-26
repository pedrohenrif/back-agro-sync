import "express-async-errors"; 
import "./instrument"; 
import * as Sentry from "@sentry/node";

import express from "express";
import cors from "cors";

import routes from "./main/routes.js"; 
import { errorMiddleware } from "./@shared/infra/http/middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

Sentry.setupExpressErrorHandler(app);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AgroSync API porta ${PORT}`);
});