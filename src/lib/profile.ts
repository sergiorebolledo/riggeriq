import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase/admin";
import type { Database } from "./supabase/types";

export type Plan = "free" | "pro";
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Obtiene el perfil Supabase del usuario Clerk autenticado, creandolo en
 * plan "free" si es su primera visita. Retorna null si no hay sesion O si
 * Supabase todavia no esta configurado (credenciales de marcador de
 * posicion): un fallo aqui nunca debe romper el render de la pagina.
 */
export async function getOrCreateProfile(): Promise<Profile | null> {
  let userId: string | null;
  try {
    ({ userId } = await auth());
  } catch (err) {
    // auth() lanza si clerkMiddleware() no corrió (p. ej. Clerk aún no
    // configurado con credenciales reales). Tratar como "sin sesión".
    console.warn("Clerk auth() no disponible todavía:", err instanceof Error ? err.message : err);
    return null;
  }
  if (!userId) return null;

  try {
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (selectError) throw new Error(selectError.message);
    if (existing) return existing;

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? null;

    const { data: created, error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert({ clerk_user_id: userId, email })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);
    return created;
  } catch (err) {
    console.warn(
      "No se pudo leer/crear el perfil en Supabase (¿faltan credenciales reales?):",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/** Plan del usuario actual ("free" si no hay sesion, no tiene perfil, o Supabase no está configurado). */
export async function getCurrentPlan(): Promise<Plan> {
  const profile = await getOrCreateProfile();
  return profile?.plan ?? "free";
}
