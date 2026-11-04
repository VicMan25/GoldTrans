import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Duracion } from '@/constants/animaciones';
import { Colors, Spacing } from '@/constants/theme';

type PropsBarra = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TAMANO_ICONO = 22;
// Ancho de una pestaña inactiva (ícono + relleno de la píldora + margen).
const ANCHO_INACTIVA = TAMANO_ICONO + 2 * 10 + 4;
// Ancho fijo de la píldora activa sin contar el texto (ícono + espacio + relleno).
const BASE_ACTIVA = TAMANO_ICONO + 6 + 2 * 14 + 4;
// Ancho medio aproximado de un carácter de la etiqueta (13 px en negrilla).
const ANCHO_CARACTER = 8.5;

// La píldora crece y las demás pestañas se reacomodan en la misma animación.
const reacomodo = LinearTransition.duration(Duracion.media);
const aparece = FadeIn.duration(Duracion.media).delay(80);
const desaparece = FadeOut.duration(Duracion.rapida);

/**
 * Barra inferior de las pestañas. Si caben, la activa muestra ícono y nombre dentro de una
 * píldora y las demás solo el ícono. Si son muchas para el ancho de la pantalla (o la letra
 * del sistema es grande), todas ocupan el mismo ancho y el nombre de la activa va debajo del
 * ícono: así ninguna pestaña se sale de la pantalla.
 * Las animaciones de Reanimated respetan "Quitar animaciones" del sistema.
 */
export function BarraPestanas({ state, descriptors, navigation, insets }: PropsBarra) {
  const { width, fontScale } = useWindowDimensions();

  const visibles = state.routes.flatMap((route, indice) => {
    const { options } = descriptors[route.key];
    // Pantallas ocultas con `href: null` en expo-router.
    if (StyleSheet.flatten(options.tabBarItemStyle)?.display === 'none') return [];
    const etiqueta = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name);
    return [{ route, indice, options, etiqueta }];
  });

  // ¿Cabe la píldora con la etiqueta más larga junto a los íconos de las demás?
  const anchoUtil = width - 2 * Spacing.sm - insets.left - insets.right;
  const etiquetaMasLarga = Math.max(0, ...visibles.map((p) => p.etiqueta.length));
  const anchoNecesario =
    BASE_ACTIVA + etiquetaMasLarga * ANCHO_CARACTER * fontScale + (visibles.length - 1) * ANCHO_INACTIVA;
  const compacta = anchoNecesario > anchoUtil;

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.barra,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
          paddingLeft: Spacing.sm + insets.left,
          paddingRight: Spacing.sm + insets.right,
        },
      ]}>
      {visibles.map(({ route, indice, options, etiqueta }) => {
        const activa = state.index === indice;
        const color = activa ? Colors.primary : Colors.muted;
        // Se monta como componente (no se llama como función) por el mismo motivo que `tabBar`.
        const Icono = options.tabBarIcon;

        function presionar() {
          const evento = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!activa && !evento.defaultPrevented) navigation.navigate(route.name, route.params);
        }

        const estiloCelda = compacta ? styles.celdaCompacta : activa ? styles.celdaActiva : styles.celda;

        return (
          <Animated.View key={route.key} layout={reacomodo} style={estiloCelda}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? etiqueta}
              testID={options.tabBarButtonTestID}
              hitSlop={4}
              onPress={presionar}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={[styles.boton, compacta && styles.botonCompacto]}>
              {({ pressed }) =>
                compacta ? (
                  <>
                    <View style={[styles.pildoraCompacta, activa && styles.pildoraActiva, pressed && styles.presionada]}>
                      {Icono ? <Icono focused={activa} color={color} size={TAMANO_ICONO} /> : null}
                    </View>
                    {activa ? (
                      <Animated.Text
                        entering={aparece}
                        exiting={desaparece}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                        style={styles.etiquetaCompacta}>
                        {etiqueta}
                      </Animated.Text>
                    ) : null}
                  </>
                ) : (
                  <Animated.View
                    layout={reacomodo}
                    style={[styles.pildora, activa && styles.pildoraActiva, activa && styles.pildoraAncha, pressed && styles.presionada]}>
                    {Icono ? <Icono focused={activa} color={color} size={TAMANO_ICONO} /> : null}
                    {activa ? (
                      <Animated.Text entering={aparece} exiting={desaparece} numberOfLines={1} style={styles.etiqueta}>
                        {etiqueta}
                      </Animated.Text>
                    ) : null}
                  </Animated.View>
                )
              }
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
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  // Las inactivas se reparten el espacio; la activa toma el ancho de su contenido.
  celda: { flex: 1, minWidth: ANCHO_INACTIVA, alignItems: 'center' },
  celdaActiva: { flexShrink: 0, alignItems: 'center', marginHorizontal: 2 },
  // Modo compacto: todas iguales, nunca más anchas que su parte de la barra.
  celdaCompacta: { flex: 1, minWidth: 0, alignItems: 'center' },
  boton: { minHeight: 44, justifyContent: 'center' },
  botonCompacto: { alignSelf: 'stretch', alignItems: 'center', paddingHorizontal: 2 },
  pildora: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pildoraCompacta: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pildoraActiva: { backgroundColor: Colors.surface },
  pildoraAncha: { paddingHorizontal: 14 },
  presionada: { opacity: 0.7 },
  etiqueta: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  etiquetaCompacta: { marginTop: 2, fontSize: 11, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
});
