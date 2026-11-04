import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Colors, Radius, Sombra, Spacing } from '@/constants/theme';

type Props<T extends string> = {
  opciones: readonly { valor: T; texto: string }[];
  valor: T;
  onCambio: (valor: T) => void;
};

const RELLENO = 4;

/** Control segmentado para cambiar entre vistas de una misma pestaña. La selección se desliza. */
export function Segmentos<T extends string>({ opciones, valor, onCambio }: Props<T>) {
  const [ancho, setAncho] = useState(0);
  const indice = opciones.findIndex((o) => o.valor === valor);
  const anchoSegmento = (ancho - RELLENO * 2) / opciones.length;
  // Hasta medir el contenedor, el segmento activo lleva su propio fondo.
  const deslizable = ancho > 0 && indice >= 0;

  return (
    <View
      style={styles.contenedor}
      accessibilityRole="tablist"
      onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
      {deslizable ? (
        <Animated.View
          style={[
            styles.indicador,
            {
              width: anchoSegmento,
              transform: [{ translateX: anchoSegmento * indice }],
              transitionProperty: 'transform',
              transitionDuration: 260,
              transitionTimingFunction: 'ease-out',
            },
          ]}
        />
      ) : null}
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
            onPress={() => onCambio(o.valor)}
            style={[styles.segmento, activo && !deslizable && styles.activo]}>
            <Text style={[styles.texto, activo && styles.textoActivo]} numberOfLines={1}>
              {o.texto}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    padding: RELLENO,
    marginBottom: Spacing.md,
    borderRadius: Radius,
    backgroundColor: Colors.surface,
  },
  indicador: {
    position: 'absolute',
    top: RELLENO,
    bottom: RELLENO,
    left: RELLENO,
    borderRadius: Radius - 3,
    backgroundColor: Colors.background,
    ...Sombra,
  },
  segmento: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius - 3, paddingHorizontal: Spacing.sm },
  activo: { backgroundColor: Colors.background, ...Sombra },
  texto: { fontSize: 14, fontWeight: '600', color: Colors.muted },
  textoActivo: { color: Colors.primary, fontWeight: '700' },
});
