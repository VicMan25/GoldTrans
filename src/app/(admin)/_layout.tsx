import { Tabs } from 'expo-router';

import { iconoPestana, propsPestanas } from '@/components/navegacion';

export default function AdminLayout() {
  return (
    <Tabs {...propsPestanas}>
      <Tabs.Screen name="usuarios" options={{ title: 'Usuarios', tabBarIcon: iconoPestana('people') }} />
      <Tabs.Screen name="flota" options={{ title: 'Flota', tabBarIcon: iconoPestana('bus') }} />
      <Tabs.Screen name="rutas" options={{ title: 'Rutas', tabBarIcon: iconoPestana('map') }} />
      <Tabs.Screen name="tarifas" options={{ title: 'Tarifas', tabBarIcon: iconoPestana('pricetags') }} />
      <Tabs.Screen
        name="paquetes"
        options={{ title: 'Paquetes', headerShown: false, popToTopOnBlur: true, tabBarIcon: iconoPestana('earth') }}
      />
      <Tabs.Screen name="ventas" options={{ title: 'Ventas', tabBarIcon: iconoPestana('cash') }} />
      <Tabs.Screen
        name="documentos/index"
        options={{ title: 'Portal', tabBarIcon: iconoPestana('folder-open') }}
      />
    </Tabs>
  );
}
