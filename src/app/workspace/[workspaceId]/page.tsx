import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceDashboard({ params }: Props) {
  const { workspaceId } = await params;
  redirect(`/workspace/${workspaceId}/flows`);
}
