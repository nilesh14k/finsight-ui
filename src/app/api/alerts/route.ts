// src/app/api/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.user.email;
}

export async function GET() {
  try {
    const email = await requireUser();
    const alerts = await prisma.alert.findMany({
      where: { user: { email } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(alerts);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message === "UNAUTHENTICATED" ? "Unauthorized" : err.message },
      { status: err.message === "UNAUTHENTICATED" ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const email = await requireUser();
    const { symbol, condition, targetPrice } = await req.json();

    if (
      typeof symbol !== "string" ||
      !["above", "below"].includes(condition) ||
      typeof targetPrice !== "number"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const alert = await prisma.alert.create({
      data: {
        symbol: symbol.toUpperCase(),
        condition,
        targetPrice,
        user: { connect: { email } },
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message === "UNAUTHENTICATED" ? "Unauthorized" : err.message },
      { status: err.message === "UNAUTHENTICATED" ? 401 : 500 }
    );
  }
}
