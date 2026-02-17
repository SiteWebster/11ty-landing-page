"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface FlowActionsProps {
  workspaceId: string;
  duplicateFlowId?: string;
  variant?: "create" | "duplicate";
}

export function FlowActions({
  workspaceId,
  duplicateFlowId,
  variant = "create",
}: FlowActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    const res = await fetch(`/api/workspaces/${workspaceId}/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Flow" }),
    });
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDuplicate() {
    if (!duplicateFlowId) return;
    setLoading(true);
    const res = await fetch(
      `/api/workspaces/${workspaceId}/flows/${duplicateFlowId}`,
      { method: "POST" }
    );
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  if (variant === "duplicate" && duplicateFlowId) {
    return (
      <button
        onClick={handleDuplicate}
        disabled={loading}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "..." : "Duplicate"}
      </button>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Creating..." : "Create New Flow"}
    </button>
  );
}
