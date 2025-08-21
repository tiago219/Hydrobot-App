export async function getStatus(baseUrl: string){
  const r = await fetch(`${baseUrl}/status`, { cache:"no-store" });
  return r.json();
}

export async function getSnapshot(baseUrl: string){
  return `${baseUrl}/capture?ts=${Date.now()}`;
}