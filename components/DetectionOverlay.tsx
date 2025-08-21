import React from "react";
import { View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { Colors } from "../constants/theme";

export default function DetectionOverlay({boxes}:{boxes:{x:number,y:number,w:number,h:number,label:string,score:number}[]}){
  return (
    <View style={{position:"absolute", left:0, top:0, right:0, bottom:0}}>
      <Svg width="100%" height="100%">
        {boxes.map((b,i)=>(
          <React.Fragment key={i}>
            <Rect x={b.x} y={b.y} width={b.w} height={b.h} stroke={Colors.accent} strokeWidth={2} fill="transparent" />
            <SvgText x={b.x+4} y={b.y+14} fill={Colors.accent}>{`${b.label} ${(b.score*100|0)}%`}</SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}