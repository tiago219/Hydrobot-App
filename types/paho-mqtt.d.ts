// mobile/types/paho-mqtt.d.ts
declare module "paho-mqtt" {
  export class Client {
    constructor(host: string, clientId?: string);
    connect(options?: {
      useSSL?: boolean;
      timeout?: number;
      keepAliveInterval?: number;
      cleanSession?: boolean;
      userName?: string;
      password?: string;
      onSuccess?: () => void;
      onFailure?: (err: { errorCode: number; errorMessage: string }) => void;
    }): void;
    disconnect(): void;
    isConnected(): boolean;

    send(message: Message): void;
    subscribe(filter: string, options?: {
      qos?: number;
      onSuccess?: () => void;
      onFailure?: (err: any) => void;
    }): void;
    unsubscribe(filter: string, options?: {
      onSuccess?: () => void;
      onFailure?: (err: any) => void;
    }): void;

    onMessageArrived?: (message: Message) => void;
    onConnectionLost?: (responseObject: { errorCode: number; errorMessage: string }) => void;
  }

  export class Message {
    constructor(payload: string | ArrayBuffer);
    payloadString: string;
    destinationName: string;
    qos: number;
    retained: boolean;
    duplicate: boolean;
  }
}