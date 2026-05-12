import { SpeakerPageView } from "@/components/SpeakerPageView";

type RoomSpeakerPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function RoomSpeakerPage({ params }: RoomSpeakerPageProps) {
  const { roomId } = await params;
  const safeRoomId = encodeURIComponent(roomId);
  const baseHref = `/room/${safeRoomId}`;

  return (
    <SpeakerPageView
      roomId={roomId}
      entranceHref={baseHref}
      audienceHref={`${baseHref}/audience`}
      stageHref={`${baseHref}/stage`}
    />
  );
}
