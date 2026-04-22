import { AppError } from "../../shared/errors/app-error.js";

export function validate(schema) {
  return (req, _res, next) => {
    const errors = [];

    if (schema.body) {
      for (const [field, rule] of Object.entries(schema.body)) {
        const value = req.body?.[field];
        const result = rule(value, req.body);
        if (result) {
          errors.push({ field: `body.${field}`, message: result });
        }
      }
    }

    if (schema.params) {
      for (const [field, rule] of Object.entries(schema.params)) {
        const value = req.params?.[field];
        const result = rule(value, req.params);
        if (result) {
          errors.push({ field: `params.${field}`, message: result });
        }
      }
    }

    if (schema.query) {
      for (const [field, rule] of Object.entries(schema.query)) {
        const value = req.query?.[field];
        const result = rule(value, req.query);
        if (result) {
          errors.push({ field: `query.${field}`, message: result });
        }
      }
    }

    if (errors.length > 0) {
      return next(new AppError(422, "Request validation failed.", errors));
    }

    next();
  };
}
