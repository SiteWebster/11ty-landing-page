import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ workspaceId: string; flowId: string }>;
}

export default async function FlowPage({ params }: Props) {
  const { workspaceId, flowId } = await params;
  redirect(`/workspace/${workspaceId}/flows/${flowId}/builder`);
}
