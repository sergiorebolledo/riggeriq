"use client";

import { useClerk } from "@clerk/nextjs";

interface SignInTriggerButtonProps {
  className?: string;
  children: React.ReactNode;
}

export function SignInTriggerButton({ className, children }: SignInTriggerButtonProps) {
  const clerk = useClerk();

  return (
    <button type="button" onClick={() => clerk.openSignIn()} className={className}>
      {children}
    </button>
  );
}
