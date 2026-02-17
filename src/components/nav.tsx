"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-gray-900">
          QuoteFlow
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/agency"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <span className="text-sm text-gray-400">
                {session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
