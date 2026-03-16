// Supabase Edge Function: create-salon
// Creates a salon + profile + admin role for the authenticated user.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const seedDefaultAccessLevels = async (adminClient: any, salonId: string) => {
  const { data: templateLevels, error: templateLevelsError } = await adminClient
    .from("access_levels")
    .select("id, name, description, system_key, color, created_at")
    .eq("is_system", true)
    .not("system_key", "is", null)
    .order("created_at", { ascending: true });

  if (templateLevelsError) {
    throw new Error(`Failed loading access level templates: ${templateLevelsError.message}`);
  }

  const templateLevelMap = new Map<string, any>();
  for (const level of templateLevels ?? []) {
    if (level.system_key && !templateLevelMap.has(level.system_key)) {
      templateLevelMap.set(level.system_key, level);
    }
  }

  const uniqueTemplateLevels = Array.from(templateLevelMap.values());
  if (uniqueTemplateLevels.length === 0) {
    return { adminAccessLevelId: null as string | null };
  }

  const templateIds = uniqueTemplateLevels.map((level) => level.id);
  const { data: templatePermissions, error: templatePermissionsError } = await adminClient
    .from("access_level_permissions")
    .select("access_level_id, permission_key, enabled")
    .in("access_level_id", templateIds);

  if (templatePermissionsError) {
    throw new Error(`Failed loading access level permissions: ${templatePermissionsError.message}`);
  }

  const { data: insertedLevels, error: insertedLevelsError } = await adminClient
    .from("access_levels")
    .insert(
      uniqueTemplateLevels.map((level) => ({
        salon_id: salonId,
        name: level.name,
        description: level.description,
        is_system: true,
        system_key: level.system_key,
        color: level.color,
      }))
    )
    .select("id, system_key");

  if (insertedLevelsError || !insertedLevels) {
    throw new Error(`Failed creating default access levels: ${insertedLevelsError?.message ?? "unknown error"}`);
  }

  const permissionsByTemplateId = new Map<string, Array<{ permission_key: string; enabled: boolean }>>();
  for (const permission of templatePermissions ?? []) {
    const existing = permissionsByTemplateId.get(permission.access_level_id) ?? [];
    existing.push({ permission_key: permission.permission_key, enabled: permission.enabled });
    permissionsByTemplateId.set(permission.access_level_id, existing);
  }

  const permissionInserts = insertedLevels.flatMap((insertedLevel: any) => {
    const templateLevel = uniqueTemplateLevels.find((level) => level.system_key === insertedLevel.system_key);
    if (!templateLevel) return [];

    return (permissionsByTemplateId.get(templateLevel.id) ?? []).map((permission) => ({
      access_level_id: insertedLevel.id,
      permission_key: permission.permission_key,
      enabled: permission.enabled,
    }));
  });

  if (permissionInserts.length > 0) {
    const { error: permissionInsertError } = await adminClient
      .from("access_level_permissions")
      .insert(permissionInserts);

    if (permissionInsertError) {
      throw new Error(`Failed creating default permissions: ${permissionInsertError.message}`);
    }
  }

  const adminAccessLevelId = insertedLevels.find((level: any) => level.system_key === "admin")?.id ?? null;
  return { adminAccessLevelId };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData?.user) {
      console.error("create-salon: auth.getUser failed", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const fullName = String(body?.fullName ?? "").trim();
    const salonName = String(body?.salonName ?? "").trim();

    if (fullName.length < 2 || salonName.length < 2) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: existingProfile, error: existingProfileError } = await adminClient
      .from("profiles")
      .select("salon_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfileError) {
      console.error("create-salon: failed checking existing profile", existingProfileError);
      return new Response(JSON.stringify({ error: "Failed checking existing profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existingProfile?.salon_id) {
      return new Response(JSON.stringify({ salonId: existingProfile.salon_id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: salon, error: salonError } = await adminClient
      .from("salons")
      .insert({ name: salonName })
      .select("id")
      .single();

    if (salonError || !salon?.id) {
      console.error("create-salon: failed creating salon", salonError);
      return new Response(JSON.stringify({ error: "Failed creating salon" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: user.id,
      salon_id: salon.id,
      full_name: fullName,
    });

    if (profileError) {
      console.error("create-salon: failed creating profile", profileError);
      return new Response(JSON.stringify({ error: "Failed creating profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let adminAccessLevelId: string | null = null;
    try {
      const seeded = await seedDefaultAccessLevels(adminClient, salon.id);
      adminAccessLevelId = seeded.adminAccessLevelId;
    } catch (seedError) {
      console.error("create-salon: failed seeding default access levels", seedError);
    }

    const rolePayload: Record<string, unknown> = {
      user_id: user.id,
      salon_id: salon.id,
      role: "admin",
    };

    if (adminAccessLevelId) {
      rolePayload.access_level_id = adminAccessLevelId;
    }

    const { error: roleError } = await adminClient.from("user_roles").insert(rolePayload);

    if (roleError) {
      console.error("create-salon: failed creating role", roleError);
      return new Response(JSON.stringify({ error: "Failed creating role" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ salonId: salon.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-salon: unhandled error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
