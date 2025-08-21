import { Link } from "expo-router";
import { Text, View } from "react-native";
import { Button, Card } from "../../components/UI";
import { gs } from "../../styles/globalStyles";

export default function Home(){
  return (
    <View style={[gs.screen, {padding:20}]}>
      <Card>
        <Text style={gs.h1}>HydroBot</Text>
        <Text style={[gs.p,{marginTop:8}]}>
          Controle remoto com câmera, detecção de fogo e modos inteligentes.
        </Text>
      </Card>
      <Card>
        <Link href="/dashboard" asChild><Button title="Abrir Dashboard" onPress={()=>{}}/></Link>
      </Card>
      <Card>
        <Link href="/camera" asChild><Button title="Ver Câmera & Joystick" onPress={()=>{}}/></Link>
      </Card>
      <Card>
        <Link href="/settings" asChild><Button title="Configurações" onPress={()=>{}}/></Link>
      </Card>
    </View>
  );
}