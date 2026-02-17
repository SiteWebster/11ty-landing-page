import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900">QuoteFlow</h1>
      <p className="mt-4 text-lg text-gray-600">
        Agency-first multi-tenant quoting platform
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Sign in
        </Link>
        <Link
          href="/agency"
          className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
