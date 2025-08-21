import * as Notifications from "expo-notifications";

export async function setupNotifications(){
  const { status } = await Notifications.requestPermissionsAsync();
  if(status !== "granted") return false;
  Notifications.setNotificationChannelAsync("alerts", {
    name: "Alerts", importance: Notifications.AndroidImportance.HIGH
  });
  return true;
}
export function notify(title: string, body: string){
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null
  });
}