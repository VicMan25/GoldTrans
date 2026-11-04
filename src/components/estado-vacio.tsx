import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import type { NombreIcono } from '@/components/boton';
import { Duracion, entradaBloque } from '@/constants/animaciones';
import { Colors, Radius, Spacing } from '@/constants/theme';

/** Lista vacía: ícono + mensaje, para que no parezca un error de carga. */
export function EstadoVacio({ icono = 'file-tray-outline', texto }: { icono?: NombreIcono; texto: string }) {
  return (
    <Animated.View entering={entradaBloque()} style={styles.caja}>
      <Animated.View entering={ZoomIn.duration(Duracion.lenta).delay(120).springify()} style={styles.icono}>
        <Ionicons name={icono} size={30} color={Colors.primary} />
      </Animated.View>
      <Text style={styles.texto}>{texto}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  caja: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  icono: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  texto: { color: Colors.muted, textAlign: 'center', fontSize: 15, lineHeight: 21 },
});
