import webpush from "web-push";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
webpush.setVapidDetails(
  "mailto:you@yourdomain.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  const { title, body } = await req.json();

  const subs = await prisma.pushSubscription.findMany();
  await Promise.all(
    subs.map(sub =>
      webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({ title, body })
        )
        .catch(console.error)
    )
  );

  return NextResponse.json({ success: true });
}
