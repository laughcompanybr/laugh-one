import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { 
  getProfile as getProfileRepo,
  getCompanyUsers as getCompanyUsersRepo,
  updateUserRole as updateUserRoleRepo
} from "../repositories/AuthRepository";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return getProfileRepo();
  });

export const getCompanyUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return getCompanyUsersRepo();
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .handler(async ({ data }) => {
    return updateUserRoleRepo({ data });
  });
