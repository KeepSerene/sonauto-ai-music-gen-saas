import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "~/server/db";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { env } from "~/env";
import {
  POLAR_PRODUCER_PACK_ID,
  POLAR_STARTER_PACK_ID,
  POLAR_STUDIO_PACK_ID,
} from "~/lib/constants";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            // Starter pack: $5 — 60 credits
            {
              productId: POLAR_STARTER_PACK_ID,
              slug: "starter",
            },
            // Producer pack: $12 — 160 credits
            {
              productId: POLAR_PRODUCER_PACK_ID,
              slug: "producer",
            },
            // Studio pack: $20 — 300 credits
            {
              productId: POLAR_STUDIO_PACK_ID,
              slug: "studio",
            },
          ],
          successUrl: "/dashboard?status=success&checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal({ returnUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard` }),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onOrderPaid: async (payload) => {
            const order = payload.data;
            const userId = order.customer.externalId as string | undefined;
            const rawCredits = order.product?.metadata.credits_to_add;
            const creditsToAdd = Number(rawCredits ?? 0);
            const finalCreditsToAdd = isNaN(creditsToAdd) ? 0 : creditsToAdd;

            if (userId && finalCreditsToAdd > 0) {
              try {
                await db.user.update({
                  where: { id: userId },
                  data: {
                    credits: { increment: creditsToAdd },
                  },
                });

                console.log(
                  `[Polar Webhook] Successfully added ${creditsToAdd} credits to user ${userId}`,
                );
              } catch (error) {
                console.error(
                  `[Polar Webhook] Failed to update credits for user ${userId}:`,
                  error,
                );
              }
            } else {
              console.warn(
                "[Polar Webhook] Ignored order: Missing userId or credits_to_add",
                { userId, creditsToAdd, orderId: order.id },
              );
            }
          },
        }),
      ],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
