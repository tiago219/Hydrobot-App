import { Pressable, Text, View } from "react-native";
import { gs } from "../styles/globalStyles";

export const Card: React.FC<React.PropsWithChildren> = ({children}) =>
  <View style={[gs.card, {marginBottom:16}]}>{children}</View>;

export const Button = ({title,onPress,kind="primary"}:{
  title: string, onPress: ()=>void, kind?: "primary"|"danger"|"ghost"
}) => (
  <Pressable onPress={onPress} style={[gs.btn,
    kind==="danger" && { backgroundColor:"#FF5C5C"},
    kind==="ghost"  && { backgroundColor:"transparent", borderWidth:1, borderColor:"#2C86FF"}]}>
    <Text style={gs.btnText}>{title}</Text>
  </Pressable>
);