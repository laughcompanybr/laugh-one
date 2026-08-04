import { createServerFn } from "@tanstack/react-start";
import { getCurrentCompany as getCompanyFromRepo } from "../repositories/TenantRepository";

export const getCurrentCompany = createServerFn({ method: "GET" })
  .handler(async () => {
    // Business logic like caching or multi-tenant validation could go here
    return getCompanyFromRepo();
  });
