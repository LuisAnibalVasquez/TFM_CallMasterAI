import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function check() {
  const email = "luisanibalvasquez@gmail.com";

  console.log("1. Checking auth.users...");
  const { data: users, error: usersErr } =
    await supabase.auth.admin.listUsers();
  if (usersErr) console.error("Auth error:", usersErr);
  else {
    const user = users.users.find((u: any) => u.email === email);
    console.log(
      "User in Auth:",
      user
        ? { id: user.id, email: user.email, confirmed_at: user.confirmed_at }
        : "Not found",
    );

    if (user) {
      console.log("\n2. Checking profiles table...");
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      console.log("Profile error:", profErr?.message || "None");
      console.log("Profile data:", profile || "Not found");

      console.log("\n3. Checking roles table...");
      const { data: role, error: roleErr } = await supabase
        .from("roles")
        .select("*")
        .eq("id", profile?.role_id)
        .single();
      console.log("Role error:", roleErr?.message || "None");
      console.log("Role data:", role || "Not found");
    }
  }
}

check();
