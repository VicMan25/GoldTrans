import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';

import { entradaBloque } from '@/constants/animaciones';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = { tipo?: 'error' | 'exito'; texto?: string | null };

/** Sacudida corta que acompaña un error: llama la atención sin ser agresiva. */
const sacudir = css.keyframes({
  '0%': { transform: [{ translateX: 0 }] },
  '20%': { transform: [{ translateX: -6 }] },
  '40%': { transform: [{ translateX: 6 }] },
  '60%': { transform: [{ translateX: -4 }] },
  '80%': { transform: [{ translateX: 3 }] },
  '100%': { transform: [{ translateX: 0 }] },
});

export function Mensaje({ tipo = 'error', texto }: Props) {
  const sinMovimiento = useReducedMotion();
  if (!texto) return null;
  const error = tipo === 'error';
  const color = error ? Colors.danger : Colors.success;
  return (
    // La key vuelve a reproducir la entrada cuando cambia el mensaje.
    <Animated.View key={texto} entering={entradaBloque()} style={styles.margen}>
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[
          styles.base,
          { backgroundColor: error ? Colors.dangerBg : Colors.successBg, borderLeftColor: color },
          error && !sinMovimiento && { animationName: sacudir, animationDuration: 380, animationDelay: 200 },
        ]}>
        <Ionicons name={error ? 'alert-circle' : 'checkmark-circle'} size={20} color={color} />
        <Text style={[styles.texto, { color }]}>{texto}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: 12,
    borderRadius: Radius,
    borderLeftWidth: 4,
  },
  margen: { marginBottom: Spacing.md },
  texto: { flex: 1, fontSize: 14, lineHeight: 20 },
});
