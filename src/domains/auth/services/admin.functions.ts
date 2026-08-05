import { createServerFn } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getAuditLogs = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("audit_log")
      .select(`
        *,
        profiles:actor (
          full_name,
          avatar_url
        )
      `)
      .order("changed_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return data;
  });

export const provisionUser = createServerFn({ method: "POST" })
  .input(z.object({
    userId: z.string().uuid(),
    companyId: z.string().uuid().optional(),
    roleId: z.string().uuid().optional(),
  }))
  .handler(async ({ data: input }) => {
    const { data, error } = await supabase.rpc("provision_user_safely", {
      p_user_id: input.userId,
      p_company_id: input.companyId,
      p_role_id: input.roleId,
    });

    if (error) throw new Error(error.message);
    return data;
  });

export const getRolesAndPermissions = createServerFn({ method: "GET" })
  .handler(async () => {
    const [rolesRes, permissionsRes, rolePermsRes] = await Promise.all([
      supabase.from("company_roles").select("*").order("order"),
      supabase.from("permissions").select("*"),
      supabase.from("role_permissions").select("*"),
    ]);

    if (rolesRes.error) throw new Error(rolesRes.error.message);
    if (permissionsRes.error) throw new Error(permissionsRes.error.message);
    if (rolePermsRes.error) throw new Error(rolePermsRes.error.message);

    return {
      roles: rolesRes.data,
      permissions: permissionsRes.data,
      rolePermissions: rolePermsRes.data,
    };
  });

export const updateRolePermissions = createServerFn({ method: "POST" })
  .input(z.object({
    roleId: z.string().uuid(),
    companyId: z.string().uuid(),
    permissionIds: z.array(z.string()),
  }))
  .handler(async ({ data: input }) => {
    // Delete existing
    const { error: delError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", input.roleId);

    if (delError) throw new Error(delError.message);

    // Insert new
    if (input.permissionIds.length > 0) {
      const { error: insError } = await supabase
        .from("role_permissions")
        .insert(
          input.permissionIds.map(permId => ({
            role_id: input.roleId,
            permission_id: permId,
            company_id: input.companyId,
          }))
        );
      if (insError) throw new Error(insError.message);
    }

    return { success: true };
  });

export const getUnlinkedUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .is("company_id", null);

    if (error) throw new Error(error.message);
    return data;
  });

export const getCompanies = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name");

    if (error) throw new Error(error.message);
    return data;
  });
