
import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabaseSync("hydrobot.db");
db.execSync(`CREATE TABLE IF NOT EXISTS detections(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT, score REAL, ts INTEGER
);`);
export function saveDetection(label: string, score: number){
  db.runSync("INSERT INTO detections(label,score,ts) VALUES(?,?,?)",[label,score,Date.now()]);
}
export function listDetections(limit = 50){
  const q = db.getAllSync<{label:string, score:number, ts:number}>(
    "SELECT label,score,ts FROM detections ORDER BY id DESC LIMIT ?", [limit]
  );
  return q;
}