import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cliente de Supabase con la Service Role Key: ignora Row Level Security.
 * Solo debe usarse en codigo de servidor (Route Handlers, Server Actions,
 * Server Components) nunca en un componente "use client".
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
