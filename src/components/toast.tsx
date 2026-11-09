import Ionicons from '@expo/vector-icons/Ionicons';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Duracion } from '@/constants/animaciones';
import { Colors, Radius, Sombra, Spacing } from '@/constants/theme';

/**
 * Avisos flotantes ("toast") que confirman una acción: guardar, eliminar, aprobar…
 * Aparecen arriba de la pantalla, se cierran solos y también al tocarlos.
 *
 * Uso:
 *   const toast = useToast();
 *   toast.exito('Vehículo guardado');
 *   toast.error('No se pudo guardar');
 *
 * Un <Modal> nativo tapa toda la app, así que cada modal con acciones incluye su
 * propio <HostToast />. Solo se pinta el host montado más recientemente (el que
 * está encima), y al cerrarse el modal el aviso sigue visible en el host de abajo.
 */

export type TipoToast = 'exito' | 'error' | 'info';

type Aviso = { id: number; tipo: TipoToast; texto: string };

type Acciones = {
  mostrar: (texto: string, tipo?: TipoToast) => void;
  exito: (texto: string) => void;
  error: (texto: string) => void;
  info: (texto: string) => void;
  ocultar: () => void;
};

type Estado = {
  aviso: Aviso | null;
  hostActivo: string | null;
  registrar: (id: string) => void;
  retirar: (id: string) => void;
};

const DURACION: Record<TipoToast, number> = { exito: 3000, info: 3500, error: 5000 };

const ESTILO: Record<TipoToast, { icono: keyof typeof Ionicons.glyphMap; color: string; fondo: string }> = {
  exito: { icono: 'checkmark-circle', color: Colors.success, fondo: Colors.successBg },
  error: { icono: 'alert-circle', color: Colors.danger, fondo: Colors.dangerBg },
  info: { icono: 'information-circle', color: Colors.primary, fondo: Colors.surface },
};

const ContextoAcciones = createContext<Acciones | null>(null);
const ContextoEstado = createContext<Estado | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [hosts, setHosts] = useState<string[]>([]);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siguienteId = useRef(0);

  const ocultar = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    setAviso(null);
  }, []);

  const mostrar = useCallback((texto: string, tipo: TipoToast = 'exito') => {
    if (temporizador.current) clearTimeout(temporizador.current);
    siguienteId.current += 1;
    setAviso({ id: siguienteId.current, tipo, texto });
    AccessibilityInfo.announceForAccessibility(texto);
    temporizador.current = setTimeout(() => {
      temporizador.current = null;
      setAviso(null);
    }, DURACION[tipo]);
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const acciones = useMemo<Acciones>(
    () => ({
      mostrar,
      exito: (t) => mostrar(t, 'exito'),
      error: (t) => mostrar(t, 'error'),
      info: (t) => mostrar(t, 'info'),
      ocultar,
    }),
    [mostrar, ocultar],
  );

  const registrar = useCallback((id: string) => setHosts((h) => [...h.filter((x) => x !== id), id]), []);
  const retirar = useCallback((id: string) => setHosts((h) => h.filter((x) => x !== id)), []);

  const estado = useMemo<Estado>(
    () => ({ aviso, hostActivo: hosts[hosts.length - 1] ?? null, registrar, retirar }),
    [aviso, hosts, registrar, retirar],
  );

  return (
    <ContextoAcciones.Provider value={acciones}>
      <ContextoEstado.Provider value={estado}>{children}</ContextoEstado.Provider>
    </ContextoAcciones.Provider>
  );
}

export function useToast(): Acciones {
  const ctx = useContext(ContextoAcciones);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

/** Lugar donde se pinta el aviso. Va en el layout raíz y dentro de cada <Modal> con acciones. */
export function HostToast() {
  const id = useId();
  const estado = useContext(ContextoEstado);
  const acciones = useContext(ContextoAcciones);
  const insets = useSafeAreaInsets();
  const registrar = estado?.registrar;
  const retirar = estado?.retirar;

  useEffect(() => {
    if (!registrar || !retirar) return;
    registrar(id);
    return () => retirar(id);
  }, [id, registrar, retirar]);

  if (!estado || !acciones || estado.hostActivo !== id || !estado.aviso) return null;
  const { aviso } = estado;
  const e = ESTILO[aviso.tipo];

  return (
    <View pointerEvents="box-none" style={[styles.capa, { top: insets.top + Spacing.sm }]}>
      <Animated.View
        key={aviso.id}
        entering={FadeInUp.duration(Duracion.media)}
        exiting={FadeOutUp.duration(Duracion.rapida)}
        style={styles.ancho}>
        <Pressable
          accessibilityRole="alert"
          accessibilityLiveRegion={aviso.tipo === 'error' ? 'assertive' : 'polite'}
          accessibilityHint="Toca para cerrar"
          onPress={acciones.ocultar}
          style={[styles.toast, Sombra, { backgroundColor: e.fondo, borderLeftColor: e.color }]}>
          <Ionicons name={e.icono} size={22} color={e.color} />
          <Text style={[styles.texto, { color: e.color }]}>{aviso.texto}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  capa: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  ancho: { width: '100%', maxWidth: 480 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius,
    borderLeftWidth: 4,
  },
  texto: { flex: 1, fontSize: 15, lineHeight: 21, fontWeight: '600' },
});
