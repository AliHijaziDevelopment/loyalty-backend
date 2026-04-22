import { AppError } from "../../shared/errors/app-error.js";

export function auth(allowedRoles) {
  return (req, _res, next) => {
    if (!req.auth?.role) {
      return next(new AppError(401, "Authenticated user role is missing."));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(new AppError(403, "You do not have access to this resource."));
    }

    next();
  };
}
