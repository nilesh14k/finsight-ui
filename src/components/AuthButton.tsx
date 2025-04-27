"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span>{session.user?.email}</span>
        <button onClick={() => signOut()} className="text-sm text-red-600">
          Sign out
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => signIn()} className="text-sm text-blue-600">
      Sign in
    </button>
  );
}
