import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Duracion } from '@/constants/animaciones';
import { Colors, Spacing } from '@/constants/theme';

type PropsBarra = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TAMANO_ICONO = 22;

// La píldora crece y las demás pestañas se reacomodan en la misma animación.
const reacomodo = LinearTransition.duration(Duracion.media);
const aparece = FadeIn.duration(Duracion.media).delay(80);
const desaparece = FadeOut.duration(Duracion.rapida);

/**
 * Barra inferior de las pestañas: la activa muestra ícono y nombre dentro de una píldora;
 * las demás solo el ícono, para no distraer. Al cambiar, la píldora se desliza a la nueva.
 * Las animaciones de Reanimated respetan "Quitar animaciones" del sistema.
 */
export function BarraPestanas({ state, descriptors, navigation, insets }: PropsBarra) {
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.barra, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      {state.routes.map((route, indice) => {
        const { options } = descriptors[route.key];
        // Pantallas ocultas con `href: null` en expo-router.
        if (StyleSheet.flatten(options.tabBarItemStyle)?.display === 'none') return null;

        const activa = state.index === indice;
        const etiqueta = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name);
        const color = activa ? Colors.primary : Colors.muted;
        // Se monta como componente (no se llama como función) por el mismo motivo que `tabBar`.
        const Icono = options.tabBarIcon;

        function presionar() {
          const evento = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!activa && !evento.defaultPrevented) navigation.navigate(route.name, route.params);
        }

        return (
          <Animated.View key={route.key} layout={reacomodo} style={activa ? styles.celdaActiva : styles.celda}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? etiqueta}
              testID={options.tabBarButtonTestID}
              hitSlop={4}
              onPress={presionar}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.boton}>
              {({ pressed }) => (
                <Animated.View
                  layout={reacomodo}
                  style={[styles.pildora, activa && styles.pildoraActiva, pressed && styles.presionada]}>
                  {Icono ? <Icono focused={activa} color={color} size={TAMANO_ICONO} /> : null}
                  {activa ? (
                    <Animated.Text entering={aparece} exiting={desaparece} numberOfLines={1} style={styles.etiqueta}>
                      {etiqueta}
                    </Animated.Text>
                  ) : null}
                </Animated.View>
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  // Las inactivas se reparten el espacio; la activa toma el ancho de su contenido.
  celda: { flex: 1, alignItems: 'center' },
  celdaActiva: { flexShrink: 0, alignItems: 'center', marginHorizontal: 2 },
  boton: { minHeight: 44, justifyContent: 'center' },
  pildora: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pildoraActiva: { backgroundColor: Colors.surface, paddingHorizontal: 14 },
  presionada: { opacity: 0.7 },
  etiqueta: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
