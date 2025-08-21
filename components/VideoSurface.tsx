import React from "react";
import { RTCView } from "react-native-webrtc";
import { WebView } from "react-native-webview";

export default function VideoSurface({mode, lanUrl, remoteStream}:{mode:"LAN"|"REMOTE", lanUrl:string, remoteStream?:any}){
  if(mode==="LAN"){
    // WebView exibe o /stream MJPEG
    return <WebView source={{ uri: `${lanUrl}/stream` }} allowsFullscreenVideo mediaPlaybackRequiresUserAction={false} />;
  }
  // REMOTE: exibe MediaStream (vindo do Peer remoto)
  return <RTCView streamURL={remoteStream?.toURL?.()} mirror={false} objectFit="cover" style={{flex:1}} />;
}