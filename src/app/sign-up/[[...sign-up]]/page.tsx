import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-status";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      {isClerkConfigured ? (
        <SignUp />
      ) : (
        <p className="max-w-sm text-center text-sm text-zinc-500 dark:text-zinc-400">
          Las cuentas todavía no están configuradas. Agrega tus credenciales reales de Clerk en{" "}
          <code>.env.local</code> (ver <code>.env.example</code>) para habilitar el registro.
        </p>
      )}
    </div>
  );
}
