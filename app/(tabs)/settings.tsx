import { Linking, Text, View } from "react-native";
import { Button, Card } from "../../components/UI";
import { setupNotifications } from "../../services/notifications";
import { gs } from "../../styles/globalStyles";

export default function Settings(){
  return (
    <View style={[gs.screen,{padding:20}]}>
      <Card><Text style={gs.h1}>Configurações</Text></Card>
      <Card>
        <Text style={gs.h2}>Notificações</Text>
        <Button title="Habilitar" onPress={()=>setupNotifications()}/>
      </Card>
      <Card>
        <Text style={gs.h2}>Emergência</Text>
        <Button title="Ligar p/ contato" onPress={()=>Linking.openURL("tel:+5511999999999")} />
      </Card>
      <Card>
        <Text style={gs.h2}>Segundo Plano</Text>
        <Text style={gs.p}>O app pode analisar cenas periodicamente.</Text>
      </Card>
    </View>
  );
}