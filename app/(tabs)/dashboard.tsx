import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Card } from "../../components/UI";
import { getStatus } from "../../services/api";
import { listDetections } from "../../services/storage";
import { gs } from "../../styles/globalStyles";

export default function Dashboard(){
  const [status, setStatus] = useState<any>({});
  const [detections, setDetections] = useState<any[]>([]);

  useEffect(()=>{ (async ()=>{
    const s = await getStatus(process.env.LOCAL_ESP_URL!); setStatus(s);
    setDetections(listDetections(20));
  })(); },[]);

  const waterPct = Math.min(100, Math.max(0, Math.round((status?.water||0)/4095*100)));
  return (
    <View style={[gs.screen, {padding:20}]}>
      <Card><Text style={gs.h1}>Status</Text>
        <Text style={gs.p}>Modo: {status?.mode}</Text>
        <Text style={gs.p}>Bateria: {status?.vbat?.toFixed?.(2)} V</Text>
        <Text style={gs.p}>Água: {waterPct}%</Text>
      </Card>
      <Card><Text style={gs.h2}>Detecções recentes</Text>
        {detections.map((d,i)=>(<Text key={i} style={gs.p}>• {d.label} ({(d.score*100|0)}%)</Text>))}
      </Card>
    </View>
  );
}