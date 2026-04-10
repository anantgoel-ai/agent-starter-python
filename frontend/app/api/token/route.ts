import { NextRequest, NextResponse } from "next/server";
import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  const { roomName, participantName } = await req.json();

  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
  const wsUrl = process.env.LIVEKIT_URL?.trim();
  const httpUrl = process.env.LIVEKIT_HTTP_URL?.trim() || wsUrl?.replace(/^wss?:\/\//, "https://");

  console.log(
    "[token] env status:",
    "LIVEKIT_URL=" + (wsUrl ? "present" : "missing"),
    "LIVEKIT_HTTP_URL=" + (process.env.LIVEKIT_HTTP_URL ? "present" : "missing"),
    "LIVEKIT_API_KEY=" + (!!apiKey ? "present" : "missing"),
    "LIVEKIT_API_SECRET=" + (!!apiSecret ? "present" : "missing")
  );

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "LiveKit credentials not configured" },
      { status: 500 }
    );
  }

  // Use the room name provided, or generate a unique one
  const room = roomName || `insights-curry-${Date.now()}`;

  // 1. Generate a JWT for the browser client
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName || `user-${Date.now()}`,
    ttl: "1h",
  });

  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();

  // 2. Dispatch "my-agent" to the room so the Python backend joins.
  //    agent_name must match @server.rtc_session(agent_name=...) in agent.py
  try {
    const agentClient = new AgentDispatchClient(httpUrl, apiKey, apiSecret);
    await agentClient.createDispatch(room, "my-agent");
    console.log(`[token] Dispatched my-agent to room: ${room}`);
  } catch (err) {
    // Agent dispatch can fail if the worker is not connected (e.g. backend not running)
    console.warn("[token] Agent dispatch failed (is the Python backend running?):", err);
  }

  return NextResponse.json({
    token,
    url: wsUrl,
    roomName: room,
  });
}
