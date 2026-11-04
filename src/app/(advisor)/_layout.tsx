import { Tabs } from 'expo-router';

import { iconoPestana, propsPestanas } from '@/components/navegacion';

export default function AdvisorLayout() {
  return (
    <Tabs {...propsPestanas}>
      <Tabs.Screen name="solicitudes" options={{ title: 'Solicitudes', tabBarIcon: iconoPestana('clipboard') }} />
      <Tabs.Screen name="abonos" options={{ title: 'Reservas', tabBarIcon: iconoPestana('wallet') }} />
      <Tabs.Screen name="documentos/index" options={{ title: 'Documentos', tabBarIcon: iconoPestana('folder-open') }} />
      <Tabs.Screen name="licitaciones" options={{ title: 'Licitaciones', tabBarIcon: iconoPestana('briefcase') }} />
    </Tabs>
  );
}
