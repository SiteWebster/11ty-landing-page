export default function SubmissionsPage() {
  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Submissions</h3>
      <p className="mt-2 text-sm text-gray-500">
        Quote submissions will appear here once the flow is published and
        clients begin filling it out.
      </p>
      <div className="mt-6 rounded border-2 border-dashed bg-gray-50 p-12 text-center text-sm text-gray-400">
        No submissions yet
      </div>
    </div>
  );
}
