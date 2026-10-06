import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

if (!url || !serviceRoleKey || !publishableKey) {
  throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_PUBLISHABLE_KEY are required");
}

const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const suffix = `mt-rls-${Date.now()}`;
const password = `RlsTest!${crypto.randomUUID()}aA1`;
const emailA = `${suffix}-a@example.invalid`;
const emailB = `${suffix}-b@example.invalid`;
const failures = [];
let userA, userB, companyA, companyB, clientB, productA, productB, orderA, orderB;

function expectBlocked(name, result, mode = "error") {
  const blocked = mode === "empty" ? !result.error && (result.data ?? []).length === 0
    : !!result.error || (result.data ?? []).length === 0;
  if (!blocked) failures.push(name);
  console.log(`${blocked ? "PASS" : "FAIL"} ${name}${result.error ? ` — ${result.error.message}` : ""}`);
}

try {
  const createdA = await admin.auth.admin.createUser({
    email: emailA, password, email_confirm: true,
    user_metadata: { full_name: "Tenant A PenTest", company_name: `${suffix} A` },
  });
  if (createdA.error) throw createdA.error;
  userA = createdA.data.user;

  const createdB = await admin.auth.admin.createUser({
    email: emailB, password, email_confirm: true,
    user_metadata: { full_name: "Tenant B PenTest", company_name: `${suffix} B` },
  });
  if (createdB.error) throw createdB.error;
  userB = createdB.data.user;

  const { data: profiles, error: profileError } = await admin
    .from("profiles").select("id,company_id").in("id", [userA.id, userB.id]);
  if (profileError) throw profileError;
  companyA = profiles.find((p) => p.id === userA.id)?.company_id;
  companyB = profiles.find((p) => p.id === userB.id)?.company_id;
  if (!companyA || !companyB || companyA === companyB) throw new Error("Tenant bootstrap failed");

  const seedClient = await admin.from("clients").insert({ company_id: companyB, name: `${suffix} B client` }).select().single();
  if (seedClient.error) throw seedClient.error;
  clientB = seedClient.data.id;

  const seedA = await admin.from("products").insert({
    company_id: companyA, name: `${suffix} A product`, cost_price: 10, sale_price: 20, stock_qty: 10,
  }).select().single();
  if (seedA.error) throw seedA.error;
  productA = seedA.data.id;

  const seedB = await admin.from("products").insert({
    company_id: companyB, name: `${suffix} B product`, cost_price: 10, sale_price: 20, stock: 10,
  }).select().single();
  if (seedB.error) throw seedB.error;
  productB = seedB.data.id;

  const seededOrderA = await admin.from("orders").insert({
    company_id: companyA, created_by: userA.id, status: "new", quantity: 1, sale_price: 20,
  }).select().single();
  if (seededOrderA.error) throw seededOrderA.error;
  orderA = seededOrderA.data.id;

  const seededOrderB = await admin.from("orders").insert({
    company_id: companyB, created_by: userB.id, status: "new", quantity: 1, sale_price: 20,
  }).select().single();
  if (seededOrderB.error) throw seededOrderB.error;
  orderB = seededOrderB.data.id;

  const tenantA = createClient(url, publishableKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const signIn = await tenantA.auth.signInWithPassword({ email: emailA, password });
  if (signIn.error) throw signIn.error;

  expectBlocked("READ Tenant B client", await tenantA.from("clients").select("id").eq("id", clientB), "empty");
  expectBlocked("READ Tenant B product", await tenantA.from("products").select("id").eq("id", productB), "empty");
  expectBlocked("READ Tenant B order", await tenantA.from("orders").select("id").eq("id", orderB), "empty");

  expectBlocked("INSERT client owned by Tenant B", await tenantA.from("clients").insert({
    company_id: companyB, name: `${suffix} injected client`,
  }).select());

  expectBlocked("UPDATE Tenant B client", await tenantA.from("clients").update({ name: "ATTACKED" }).eq("id", clientB).select());
  expectBlocked("DELETE Tenant B client", await tenantA.from("clients").delete().eq("id", clientB).select());

  const own = await tenantA.from("clients").insert({ company_id: companyA, name: `${suffix} own client` }).select().single();
  if (own.error) throw own.error;
  const reassignment = await tenantA.from("clients").update({ company_id: companyB }).eq("id", own.data.id).select();
  expectBlocked("REASSIGN own row to Tenant B", reassignment);
  await admin.from("clients").delete().eq("id", own.data.id);

  expectBlocked("INSERT order_item into Tenant B order", await tenantA.from("order_items").insert({
    order_id: orderB, product_id: productB, name_snapshot: "cross-tenant", quantity: 1,
    unit_sale_price: 20, unit_cost_price: 10,
  }).select());

  expectBlocked("RELATE Tenant A order to Tenant B product", await tenantA.from("order_items").insert({
    order_id: orderA, product_id: productB, name_snapshot: "cross-product", quantity: 1,
    unit_sale_price: 20, unit_cost_price: 10,
  }).select());

  expectBlocked("CREATE movement for Tenant B product", await tenantA.from("product_movements").insert({
    product_id: productB, qty: 1, qty_after: 11, type: "in", reason: "cross-tenant",
  }).select());

  expectBlocked("RPC adjust_product_stock on Tenant B", await tenantA.rpc("adjust_product_stock", {
    _product_id: productB, _qty: 1, _reason: "cross-tenant", _type: "in",
  }));
  expectBlocked("RPC apply_order_stock_out on Tenant B", await tenantA.rpc("apply_order_stock_out", { _order_id: orderB }));
  expectBlocked("RPC revert_order_stock on Tenant B", await tenantA.rpc("revert_order_stock", { _order_id: orderB }));
  expectBlocked("RPC get_module_access_indicators for Tenant B user", await tenantA.rpc("get_module_access_indicators", { _user_id: userB.id }));
  expectBlocked("RPC log_audit_event for Tenant B", await tenantA.rpc("log_audit_event", {
    p_action: "cross_tenant_test", p_company_id: companyB, p_entity_id: clientB,
    p_entity_type: "client", p_new_data: { attack: true }, p_old_data: null, p_request_id: suffix,
  }));

  if (failures.length) throw new Error(`Multi-tenant penetration test failed: ${failures.join("; ")}`);
  console.log("\nALL MULTI-TENANT ATTACKS BLOCKED");
} finally {
  if (orderA) await admin.from("order_items").delete().eq("order_id", orderA);
  if (orderB) await admin.from("order_items").delete().eq("order_id", orderB);
  if (orderA) await admin.from("orders").delete().eq("id", orderA);
  if (orderB) await admin.from("orders").delete().eq("id", orderB);
  if (productA) await admin.from("products").delete().eq("id", productA);
  if (productB) await admin.from("products").delete().eq("id", productB);
  if (clientB) await admin.from("clients").delete().eq("id", clientB);
  if (companyA) await admin.from("company_roles").delete().eq("company_id", companyA);
  if (companyB) await admin.from("company_roles").delete().eq("company_id", companyB);
  if (companyA) await admin.from("companies").delete().eq("id", companyA);
  if (companyB) await admin.from("companies").delete().eq("id", companyB);
  if (userA) await admin.auth.admin.deleteUser(userA.id);
  if (userB) await admin.auth.admin.deleteUser(userB.id);
}
