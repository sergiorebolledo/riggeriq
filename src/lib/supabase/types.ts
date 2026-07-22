/**
 * Tipos manuales que reflejan supabase/migrations/0001_init.sql.
 * Si se genera el esquema real con `supabase gen types typescript`, este
 * archivo puede reemplazarse por el generado.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string | null;
          plan: "free" | "pro";
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email?: string | null;
          plan?: "free" | "pro";
          stripe_customer_id?: string | null;
        };
        Update: {
          email?: string | null;
          plan?: "free" | "pro";
          stripe_customer_id?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          status: string;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          status: string;
          current_period_end?: string | null;
        };
        Update: {
          stripe_price_id?: string;
          status?: string;
          current_period_end?: string | null;
        };
        Relationships: [];
      };
      lifting_plans: {
        Row: {
          id: string;
          profile_id: string;
          title: string | null;
          input: unknown;
          result: unknown;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title?: string | null;
          input: unknown;
          result: unknown;
          status: string;
        };
        Update: {
          title?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
