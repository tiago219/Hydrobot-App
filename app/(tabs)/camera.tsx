import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import DetectionOverlay from "../../components/DetectionOverlay";
import Joystick from "../../components/Joystick";
import { Button } from "../../components/UI";
import VideoSurface from "../../components/VideoSurface";
import { connectMQTT, publishCmd } from "../../services/mqttClient";
import { isSameLAN } from "../../services/networkDetect";
import { openRTCPeer } from "../../services/webrtcClient";
import { gs } from "../../styles/globalStyles";

const DEVICE_ID   = process.env.DEVICE_ID!;
const MQTT_URL    = process.env.MQTT_URL!;
const MQTT_BASE   = process.env.MQTT_TOPIC_BASE!;
const LOCAL_ESP   = process.env.LOCAL_ESP_URL!;
const SIGNAL_URL  = process.env.REMOTE_SIGNALING_URL!;

export default function Camera(){
  const [mode, setMode] = useState<"LAN"|"REMOTE">("LAN");
  const [tfOn, setTfOn] = useState(false);
  const [boxes, setBoxes] = useState<any[]>([]);
  const [remoteStream, setRemoteStream] = useState<any>(null);

  useEffect(()=>{ (async ()=>{
    const lan = await isSameLAN(LOCAL_ESP);
    setMode(lan ? "LAN" : "REMOTE");
    const mqtt = connectMQTT(MQTT_URL);
    if(!lan){
      const { peer } = openRTCPeer(SIGNAL_URL);
      peer.on("stream", setRemoteStream);
    }
  })(); },[]);

  const sendDir = (dir: "FWD"|"BACK"|"LEFT"|"RIGHT"|"STOP") =>
    publishCmd(MQTT_BASE, DEVICE_ID, { type:"MOVE", dir });

  const setModeCmd = (m: "MANUAL"|"AUTO"|"PATROL") =>
    publishCmd(MQTT_BASE, DEVICE_ID, { type:"MODE", value:m });

  return (
    <View style={[gs.screen, {padding:0}]}>
      <View style={{flex:1}}>
        <VideoSurface mode={mode} lanUrl={LOCAL_ESP} remoteStream={remoteStream}/>
        <DetectionOverlay boxes={boxes}/>
      </View>

      <View style={{padding:16}}>
        <Joystick onDir={sendDir}/>
        <View style={{flexDirection:"row", justifyContent:"space-between", marginTop:12}}>
          <Button title="Manual"   onPress={()=>setModeCmd("MANUAL")} />
          <Button title="Auto"     onPress={()=>setModeCmd("AUTO")} />
          <Button title="Patrulha" onPress={()=>setModeCmd("PATROL")} />
        </View>
        <View style={{flexDirection:"row", justifyContent:"space-between", marginTop:12}}>
          <Text style={gs.p}>TensorFlow</Text>
          <Switch value={tfOn} onValueChange={setTfOn}/>
        </View>
      </View>
    </View>
  );
}