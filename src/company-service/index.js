export {
  companySuperAdminRouter as companySuperAdminRoutes,
  companyAdminRouter as companyAdminRoutes,
} from "./companies/routes.js";
export { companyUsersSuperAdminRouter as companyUsersSuperAdminRoutes } from "./company-users/routes.js";
export { tierSettingsAdminRouter as tierSettingsAdminRoutes } from "./tier-settings/routes.js";
export { birthdaySettingsAdminRouter as birthdaySettingsAdminRoutes } from "./birthday-settings/routes.js";
export { birthdayAdminRouter as birthdayAdminRoutes, birthdayClientRouter as birthdayClientRoutes } from "./birthday/routes.js";
