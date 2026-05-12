import { StageShareView } from "@/components/StageShareView";

type RoomStagePageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function RoomStagePage({ params }: RoomStagePageProps) {
  const { roomId } = await params;

  return <StageShareView roomId={roomId} />;
}
