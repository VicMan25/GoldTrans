import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps, type View as ViewType } from 'react-native';
import Animated from 'react-native-reanimated';

import type { NombreIcono } from '@/components/boton';
import { ESCALA_PRESIONADO, transicionPresion } from '@/constants/animaciones';
import { Colors, Radius, Sombra, Spacing } from '@/constants/theme';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  icono: NombreIcono;
  titulo: string;
  detalle?: string;
};

/** Tarjeta de acceso directo con ícono (inicio y login). Funciona con <Link asChild>. */
export const AccesoRapido = forwardRef<ViewType, Props>(function AccesoRapido({ icono, titulo, detalle, ...rest }, ref) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={detalle ? `${titulo}. ${detalle}` : titulo}
      {...rest}
      // Estilo visual en la View interna: en web, <Link asChild> combina su style con el del hijo
      // y un style en forma de función dejaría de aplicarse.
      style={styles.contenedor}>
      {({ pressed }) => (
        <Animated.View style={[styles.tarjeta, transicionPresion, pressed && styles.presionada]}>
          <View style={styles.icono}>
            <Ionicons name={icono} size={24} color={Colors.primary} />
          </View>
          <Text style={styles.titulo}>{titulo}</Text>
          {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
        </Animated.View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  tarjeta: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius + 4,
    backgroundColor: Colors.background,
    borderBottomWidth: 3,
    borderBottomColor: Colors.accent,
    ...Sombra,
  },
  presionada: { backgroundColor: Colors.surface, transform: [{ scale: ESCALA_PRESIONADO }] },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  titulo: { fontSize: 16, fontWeight: '700', color: Colors.text },
  detalle: { fontSize: 13, color: Colors.muted, marginTop: 2 },
});
