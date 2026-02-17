"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface FlowTabsProps {
  workspaceId: string;
  flowId: string;
}

export function FlowTabs({ workspaceId, flowId }: FlowTabsProps) {
  const pathname = usePathname();
  const base = `/workspace/${workspaceId}/flows/${flowId}`;

  const tabs = [
    { label: "Builder", href: `${base}/builder` },
    { label: "Publish", href: `${base}/publish` },
    { label: "Submissions", href: `${base}/submissions` },
  ];

  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
