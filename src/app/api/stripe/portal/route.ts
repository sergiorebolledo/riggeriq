import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateProfile } from "@/lib/profile";
import { stripe } from "@/lib/stripe/client";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const profile = await getOrCreateProfile();
  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Este usuario no tiene una suscripción activa." },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/precios`,
  });

  return NextResponse.json({ url: session.url });
}
