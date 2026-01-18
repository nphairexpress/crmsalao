// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Validate requester
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const requesterId = userData.user.id;

    const body = await req.json();
    const { email, password, fullName, salonId, professionalId } = body ?? {};

    if (!email || !password || !fullName || !salonId || !professionalId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Ensure requester is admin in this salon
    const { data: roleRow, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requesterId)
      .eq("salon_id", salonId)
      .maybeSingle();

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), { status: 400 });
    }

    if (!roleRow || roleRow.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    // Create auth user
    const { data: created, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createUserError || !created.user) {
      return new Response(JSON.stringify({ error: createUserError?.message ?? "Failed" }), { status: 400 });
    }

    const newUserId = created.user.id;

    // Create profile + role
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ user_id: newUserId, salon_id: salonId, full_name: fullName });

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), { status: 400 });
    }

    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUserId, salon_id: salonId, role: "professional" });

    if (roleInsertError) {
      return new Response(JSON.stringify({ error: roleInsertError.message }), { status: 400 });
    }

    // Link professional record to auth user
    const { error: professionalUpdateError } = await supabaseAdmin
      .from("professionals")
      .update({ user_id: newUserId, create_access: true })
      .eq("id", professionalId)
      .eq("salon_id", salonId);

    if (professionalUpdateError) {
      return new Response(JSON.stringify({ error: professionalUpdateError.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ user_id: newUserId }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
