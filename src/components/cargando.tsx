import type { ReactElement } from 'react';
import { StyleSheet, View, type ListRenderItem, type ListRenderItemInfo } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';

import { entradaLista } from '@/constants/animaciones';
import { Colors, Radius, Spacing } from '@/constants/theme';

const latido = css.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0.45 },
});

const salto = css.keyframes({
  '0%': { transform: [{ translateY: 0 }], opacity: 0.5 },
  '30%': { transform: [{ translateY: -7 }], opacity: 1 },
  '60%': { transform: [{ translateY: 0 }], opacity: 0.5 },
  '100%': { transform: [{ translateY: 0 }], opacity: 0.5 },
});

type PropsEsqueleto = {
  /** Número de tarjetas de relleno. */
  filas?: number;
  /** "foto" agrega el espacio de la imagen (catálogo de paquetes). */
  variante?: 'tarjeta' | 'foto';
};

/**
 * Esqueleto de carga: tarjetas grises con la forma del contenido que late en ola mientras
 * llegan los datos. Se percibe más rápido que un spinner porque anticipa el diseño.
 */
export function EsqueletoLista({ filas = 3, variante = 'tarjeta' }: PropsEsqueleto) {
  const sinMovimiento = useReducedMotion();
  return (
    <View style={styles.lista} accessibilityRole="progressbar" accessibilityLabel="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.tarjeta,
            !sinMovimiento && {
              animationName: latido,
              animationDuration: 750,
              animationDelay: i * 120,
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationTimingFunction: 'ease-in-out',
            },
          ]}>
          {variante === 'foto' ? <View style={styles.foto} /> : null}
          <View style={styles.cuerpo}>
            <View style={[styles.barra, styles.titulo]} />
            <View style={[styles.barra, { width: '85%' }]} />
            <View style={[styles.barra, { width: '45%' }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

/** Tres puntos de marca que saltan en secuencia: esperas cortas en pantallas centradas. */
export function CargandoPuntos() {
  const sinMovimiento = useReducedMotion();
  return (
    <View style={styles.puntos} accessibilityRole="progressbar" accessibilityLabel="Cargando">
      {[Colors.primary, Colors.accent, Colors.primary].map((color, i) => (
        <Animated.View
          key={i}
          style={[
            styles.punto,
            { backgroundColor: color },
            !sinMovimiento && {
              animationName: salto,
              animationDuration: 900,
              animationDelay: i * 140,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            },
          ]}
        />
      ))}
    </View>
  );
}

/**
 * Envuelve el renderItem de un FlatList para que las tarjetas entren escalonadas.
 * FlatList la llama como función, no como componente: debe ser anónima y en minúscula
 * para que el React Compiler no le inyecte hooks (daría "Invalid hook call").
 */
export function conEntrada<T>(render: (info: ListRenderItemInfo<T>) => ReactElement | null): ListRenderItem<T> {
  function itemAnimado(info: ListRenderItemInfo<T>) {
    return <Animated.View entering={entradaLista(info.index)}>{render(info)}</Animated.View>;
  }
  return itemAnimado;
}

const styles = StyleSheet.create({
  lista: { gap: Spacing.md, width: '100%', maxWidth: 560, alignSelf: 'center' },
  tarjeta: {
    borderRadius: Radius,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  foto: { width: '100%', aspectRatio: 16 / 9, backgroundColor: Colors.surface },
  cuerpo: { padding: Spacing.md, gap: Spacing.sm },
  barra: { height: 12, borderRadius: 6, backgroundColor: Colors.surface },
  titulo: { height: 16, width: '60%' },
  puntos: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: Spacing.lg },
  punto: { width: 10, height: 10, borderRadius: 5 },
});
