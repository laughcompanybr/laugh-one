-- The login flow calls this authenticated workspace bootstrap RPC after sign-in.
-- Keep the function SECURITY DEFINER for its internal provisioning work, but
-- explicitly allow only authenticated users to invoke it.
grant execute on function public.bootstrap_current_user_workspace() to authenticated;
revoke execute on function public.bootstrap_current_user_workspace() from anon;
