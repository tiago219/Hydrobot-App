// services/background.ts
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { saveDetection } from "./storage";

const TASK = "hydrobot-bg-detect";

TaskManager.defineTask(TASK, async () => {
  try {
    // seu trabalho leve em segundo plano
    saveDetection("heartbeat", 1);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBGTask() {
  await BackgroundFetch.registerTaskAsync(TASK, {
    minimumInterval: 60, // segundos
    stopOnTerminate: false,
    startOnBoot: true
  });
}

export async function unregisterBGTask() {
  try { await BackgroundFetch.unregisterTaskAsync(TASK); } catch {}
}