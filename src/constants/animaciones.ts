import { FadeIn, FadeInDown, type CSSTransitionProperties } from 'react-native-reanimated';

/**
 * Animaciones de la app. Todas corren en el hilo de UI (Reanimated) y son cortas:
 * se notan sin hacer esperar. Las de entrada respetan "Reducir movimiento" del sistema.
 */
export const Duracion = {
  rapida: 150,
  media: 280,
  lenta: 450,
} as const;

/** Elementos posteriores a este aparecen sin retraso extra (al hacer scroll no deben esperar). */
const MAX_ESCALONADOS = 6;

/** Entrada escalonada de tarjetas en una lista: cada una 50 ms después de la anterior. */
export function entradaLista(indice: number) {
  return FadeInDown.duration(Duracion.media).delay(Math.min(indice, MAX_ESCALONADOS) * 50);
}

/** Entrada de un bloque de contenido (resultado, aviso, sección). */
export function entradaBloque(retraso = 0) {
  return FadeInDown.duration(Duracion.media).delay(retraso);
}

export const entradaSuave = FadeIn.duration(Duracion.rapida);

/** Transición al presionar botones y tarjetas: se hunden levemente. */
export const transicionPresion: CSSTransitionProperties = {
  transitionProperty: ['transform', 'opacity', 'backgroundColor'],
  transitionDuration: 140,
  transitionTimingFunction: 'ease-out',
};

export const ESCALA_PRESIONADO = 0.97;
