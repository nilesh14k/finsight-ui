// src/app/api/watchlists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function requireUserEmail() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");
  return session.user.email;
}

export async function GET() {
  try {
    const email = await requireUserEmail();
    const lists = await prisma.watchlist.findMany({
      where: { user: { email } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(lists);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message === "UNAUTHENTICATED" ? "Unauthorized" : err.message },
      { status: err.message === "UNAUTHENTICATED" ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const email = await requireUserEmail();
    const { name, symbols } = await req.json();
    if (typeof name !== "string" || !Array.isArray(symbols)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const list = await prisma.watchlist.create({
      data: {
        name,
        symbols: symbols.map((s: string) => s.toUpperCase()),
        user: { connect: { email } },
      },
    });
    return NextResponse.json(list, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message === "UNAUTHENTICATED" ? "Unauthorized" : err.message },
      { status: err.message === "UNAUTHENTICATED" ? 401 : 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const email = await requireUserEmail();
    const { id } = await req.json();
    await prisma.watchlist.deleteMany({
      where: { id, user: { email } },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message === "UNAUTHENTICATED" ? "Unauthorized" : err.message },
      { status: err.message === "UNAUTHENTICATED" ? 401 : 500 }
    );
  }
}
