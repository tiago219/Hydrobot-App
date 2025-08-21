import { StyleSheet } from "react-native";
import { Colors, Radius, Spacing } from "../constants/theme";

export const gs = StyleSheet.create({
  screen: { flex:1, backgroundColor: Colors.bg },
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.lg
  },
  h1: { color: Colors.text, fontSize: 28, fontWeight: "700" },
  h2: { color: Colors.text, fontSize: 20, fontWeight: "600" },
  p:  { color: Colors.sub,  fontSize: 15 },
  row: { flexDirection:"row", alignItems:"center" },
  btn: {
    backgroundColor: Colors.primary, paddingVertical:14, paddingHorizontal:18,
    borderRadius: Radius.md, alignItems:"center", justifyContent:"center"
  },
  btnText: { color:"#fff", fontWeight:"700" }
});