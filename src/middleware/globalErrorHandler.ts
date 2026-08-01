import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provided incorrect fields or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage =
        "An operation failed because it depends on one or more records that were required but not found. {cause}";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage =
        "Unique constraint failed on the {constraint}"
    }
    else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed on the field: {field_name}";
    }
  }

  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution"
  }
  else if (err instanceof Prisma.PrismaClientInitializationError) {
   if (err.errorCode === "P1000") {
     statusCode = 401;
     errorMessage =
       "Wrong Credential. Please Check email and password";
    }
   else if (err.errorCode === "P1001") {
     statusCode = 400;
     errorMessage = "Can't reach database at server"
    }
  }
  res.status(500);
  res.json({
    message: errorMessage,
    error: errorDetails,
  });
}

export default errorHandler;
