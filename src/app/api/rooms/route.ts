import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { appConfig } from "@/config/app";
import { createMeetingRoomInSupabase } from "@/services/supabaseRooms";

type RoomCreationError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  statusText?: string;
};

let serverClient: SupabaseClient | null = null;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;
  if (serverClient) return serverClient;

  serverClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serverClient;
}

function normalizeRoomCreationError(error: unknown): RoomCreationError {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
    };
  }

  if (typeof error !== "object" || error === null) {
    return {
      message: "Unknown room creation error.",
    };
  }

  const source = error as Record<string, unknown>;
  const normalized: RoomCreationError = {
    message:
      typeof source.message === "string"
        ? source.message
        : "Unknown room creation error.",
  };

  for (const key of ["code", "details", "hint", "statusText"] as const) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      normalized[key] = value;
    }
  }

  if (typeof source.status === "number") {
    normalized.status = source.status;
  }

  return normalized;
}

export async function POST(request: Request) {
  const hostKey = request.headers.get("x-host-key") ?? "";

  if (hostKey !== appConfig.access.hostKey) {
    return NextResponse.json(
      {
        error: {
          message: "ホストキーが違います。",
          status: 403,
        },
      },
      { status: 403 },
    );
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      {
        error: {
          message: "Supabaseの環境変数が未設定です。",
          status: 500,
        },
      },
      { status: 500 },
    );
  }

  try {
    const room = await createMeetingRoomInSupabase(supabase);
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    const normalizedError = normalizeRoomCreationError(error);
    console.error("Room API creation failed.", normalizedError);

    return NextResponse.json(
      {
        error: normalizedError,
      },
      { status: normalizedError.status ?? 500 },
    );
  }
}
