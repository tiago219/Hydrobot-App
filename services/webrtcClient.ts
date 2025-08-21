// services/webrtcClient.ts
import SimplePeer, { Instance, SignalData } from "simple-peer";

export function openRTCPeer(signalUrl: string) {
  const ws = new WebSocket(signalUrl);
  const peer: Instance = new SimplePeer({ initiator: true, trickle: true });

  ws.onmessage = (ev: MessageEvent) => {
    try {
      const msg = JSON.parse(String((ev as any).data));
      if (msg.type === "signal") peer.signal(msg.data as SignalData);
    } catch (err) {
      console.warn("signal parse error", err);
    }
  };

  peer.on("signal", (data: SignalData) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "signal", data }));
    }
  });

  peer.on("error", (err: Error) => console.warn("peer error", err));
  return { peer, ws };
}