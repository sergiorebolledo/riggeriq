import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { SignInTriggerButton } from "@/components/auth/SignInTriggerButton";
import { isClerkConfigured } from "@/lib/clerk-status";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-8">
        <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Rigging Pro AI
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/precios"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Precios
          </Link>
          {isClerkConfigured ? (
            <>
              <SignedOut>
                <SignInTriggerButton className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Iniciar sesión
                </SignInTriggerButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          ) : (
            <span
              title="Configura NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY y CLERK_SECRET_KEY en .env.local para habilitar cuentas"
              className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
            >
              Cuentas próximamente
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
