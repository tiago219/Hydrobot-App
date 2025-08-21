import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/theme";

export default function TabsLayout(){
  return (
    <Tabs screenOptions={{ headerStyle:{backgroundColor:Colors.bg}, headerTintColor:"#fff",
      tabBarStyle:{ backgroundColor:"#0b1220", borderTopColor:"#0b1220"},
      tabBarActiveTintColor: Colors.accent
    }}>
      <Tabs.Screen name="index" options={{ title:"Home", tabBarIcon:({color,size})=> <Ionicons name="home" color={color} size={size}/> }}/>
      <Tabs.Screen name="dashboard" options={{ title:"Dashboard", tabBarIcon:({color,size})=> <Ionicons name="pulse" color={color} size={size}/> }}/>
      <Tabs.Screen name="camera" options={{ title:"Camera", tabBarIcon:({color,size})=> <Ionicons name="videocam" color={color} size={size}/> }}/>
      <Tabs.Screen name="settings" options={{ title:"Settings", tabBarIcon:({color,size})=> <Ionicons name="settings" color={color} size={size}/> }}/>
    </Tabs>
  );
}