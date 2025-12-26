import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

const validateSchema =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((msg) => msg.message),
      });
    }

    next();
  };

export default validateSchema;
