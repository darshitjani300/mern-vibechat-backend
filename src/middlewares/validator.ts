import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

const validateSchema =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((msg) => msg.message),
      });
    }

    req.body = value;
    next();
  };

export default validateSchema;
