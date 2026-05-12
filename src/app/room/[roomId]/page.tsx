import { EntryPageView } from "@/components/EntryPageView";

type RoomEntrancePageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function RoomEntrancePage({
  params,
}: RoomEntrancePageProps) {
  const { roomId } = await params;
  const safeRoomId = encodeURIComponent(roomId);
  const baseHref = `/room/${safeRoomId}`;

  return (
    <EntryPageView
      roomId={roomId}
      speakerHref={`${baseHref}/speaker`}
      audienceHref={`${baseHref}/audience`}
    />
  );
}
