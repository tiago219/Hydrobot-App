import { Stack } from "expo-router";
import { Colors } from "../constants/theme";
export default function RootLayout(){
  return (
    <Stack screenOptions={{ headerStyle:{backgroundColor:Colors.bg}, headerTintColor:"#fff" }}>
      <Stack.Screen name="(tabs)/_layout" options={{ headerShown:false }}/>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}