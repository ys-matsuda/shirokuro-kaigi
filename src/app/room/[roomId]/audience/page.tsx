import { AudiencePageView } from "@/components/AudiencePageView";

type RoomAudiencePageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function RoomAudiencePage({
  params,
}: RoomAudiencePageProps) {
  const { roomId } = await params;
  const safeRoomId = encodeURIComponent(roomId);
  const baseHref = `/room/${safeRoomId}`;

  return (
    <AudiencePageView
      roomId={roomId}
      entranceHref={baseHref}
      speakerHref={`${baseHref}/speaker`}
      stageHref={`${baseHref}/stage`}
    />
  );
}
