import React, { useRef } from "react";
import { PanResponder, PanResponderInstance, View } from "react-native";
import { Colors } from "../constants/theme";

export default function Joystick({onDir}:{onDir:(d:"FWD"|"BACK"|"LEFT"|"RIGHT"|"STOP")=>void}){
  const start = useRef<{x:number,y:number}|null>(null);
  const pr = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder:()=>true,
      onPanResponderGrant:(e,g)=>{ start.current = {x:g.x0, y:g.y0}; },
      onPanResponderMove:(e,g)=>{
        if(!start.current) return;
        const dx = g.moveX - start.current.x; const dy = g.moveY - start.current.y;
        if(Math.abs(dx)>Math.abs(dy)) onDir(dx>0?"RIGHT":"LEFT");
        else onDir(dy>0?"BACK":"FWD");
      },
      onPanResponderRelease:()=>onDir("STOP")
    })
  ).current;

  return <View {...pr.panHandlers} style={{
    height:180, borderRadius:100, backgroundColor:"#0f172a", borderWidth:2, borderColor:Colors.primary, marginTop:12
  }}/>;
}