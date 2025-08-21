// services/mqttClient.ts
import { Message, Client as PahoClient } from "paho-mqtt";

let client: PahoClient | null = null;
const handlers = new Map<string, (payload: string) => void>();

type ConnectOptions = {
  useSSL?: boolean;
  timeout?: number;
  keepAliveInterval?: number;
  cleanSession?: boolean;
  onSuccess?: () => void;
  onFailure?: (err: { errorCode: number; errorMessage: string }) => void;
};

export function connectMQTT(url: string, clientId = `hydrobot-${Date.now()}`) {
  client = new PahoClient(url, clientId);
  (client as any).onMessageArrived = (m: Message) => {
    const cb = handlers.get(m.destinationName);
    if (cb) cb(m.payloadString);
  };
  return new Promise<PahoClient>((resolve, reject) => {
    const opts: ConnectOptions = {
      useSSL: url.startsWith("wss"),
      timeout: 5,
      keepAliveInterval: 30,
      cleanSession: true,
      onSuccess: () => resolve(client!),
      onFailure: (err) => reject(new Error(`${err.errorCode}: ${err.errorMessage}`))
    };
    (client as any).connect(opts);
  });
}

export function publishCmd(base: string, deviceId: string, body: any) {
  if (!client) return;
  const msg = new Message(JSON.stringify(body));
  msg.destinationName = `${base}/${deviceId}/cmd`;
  if ((client as any).isConnected?.()) (client as any).send(msg);
}

export function subscribe(topic: string, cb: (payload: string) => void) {
  if (!client) throw new Error("MQTT não conectado");
  handlers.set(topic, cb);
  (client as any).subscribe(topic);
  return () => { handlers.delete(topic); (client as any).unsubscribe(topic); };
}

export const isConnected = () => !!client && Boolean((client as any).isConnected?.());
export function disconnect(){ if (isConnected()) (client as any).disconnect(); client = null; }