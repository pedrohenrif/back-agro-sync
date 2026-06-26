import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../../../errors/AppError.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  next 
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
    return; 
  }

  console.error("Internal Error:", error);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
  return;
};