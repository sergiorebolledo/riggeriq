import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateProfile } from "@/lib/profile";
import { stripe } from "@/lib/stripe/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const profile = await getOrCreateProfile();
  if (!profile) {
    return NextResponse.json({ error: "No se pudo obtener el perfil." }, { status: 500 });
  }

  let stripeCustomerId = profile.stripe_customer_id;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: profile.email ?? undefined,
      metadata: { clerk_user_id: userId },
    });
    stripeCustomerId = customer.id;
    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", profile.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/precios?checkout=success`,
    cancel_url: `${appUrl}/precios?checkout=cancelled`,
    metadata: { clerk_user_id: userId },
  });

  return NextResponse.json({ url: session.url });
}
