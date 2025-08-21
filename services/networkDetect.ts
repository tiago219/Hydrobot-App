import * as Network from "expo-network";

export async function isSameLAN(espUrl: string) {
  try {
    const state = await Network.getNetworkStateAsync();
    if(!state.isConnected) return false;
    const r = await fetch(`${espUrl}/status`, { method:"GET", cache:"no-store", signal: AbortSignal.timeout(1200) });
    return r.ok;
  } catch { return false; }
}