import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';

import { Logo } from '@/components/logo';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { rutaInicio } from '@/lib/roles';

/** Lo que dura la entrada del logo: la intro se muestra completa una vez por sesión de la app. */
const INTRO_MS = 900;
let introMostrada = false;

const TAMANO_LOGO = 150;
const ANCHO_PISTA = 140;
const ANCHO_BARRA = 52;

const aparecer = css.keyframes({
  from: { opacity: 0, transform: [{ scale: 0.88 }] },
  to: { opacity: 1, transform: [{ scale: 1 }] },
});

const respirar = css.keyframes({
  from: { transform: [{ scale: 1 }] },
  to: { transform: [{ scale: 1.04 }] },
});

const subir = css.keyframes({
  from: { opacity: 0, transform: [{ translateY: 10 }] },
  to: { opacity: 1, transform: [{ translateY: 0 }] },
});

const recorrer = css.keyframes({
  from: { transform: [{ translateX: -ANCHO_BARRA }] },
  to: { transform: [{ translateX: ANCHO_PISTA }] },
});

/** Punto de entrada: espera a restaurar la sesión y envía a la pantalla de inicio del rol. */
export default function Index() {
  const { cargando, rol } = useAuth();
  const [introLista, setIntroLista] = useState(introMostrada);

  useEffect(() => {
    if (introLista) return;
    const t = setTimeout(() => {
      introMostrada = true;
      setIntroLista(true);
    }, INTRO_MS);
    return () => clearTimeout(t);
  }, [introLista]);

  if (cargando || !introLista) return <Intro />;

  return <Redirect href={rutaInicio(rol)} />;
}

/** Logo que aparece y "respira", nombre de la empresa y barra dorada de progreso. */
function Intro() {
  const sinMovimiento = useReducedMotion();

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel="Cargando GOLDTRANS">
      <Animated.View style={!sinMovimiento && { animationName: aparecer, animationDuration: 500, animationTimingFunction: 'ease-out' }}>
        <Animated.View
          style={!sinMovimiento && {
            animationName: respirar,
            animationDuration: 1400,
            animationDelay: 500,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
          }}>
          <Logo tamano={TAMANO_LOGO} />
        </Animated.View>
      </Animated.View>

      {/* Debajo del logo sin desplazarlo: el logo queda donde estaba en el splash nativo. */}
      <View style={styles.debajo}>
        <Animated.Text
          style={[
            styles.title,
            !sinMovimiento && { animationName: subir, animationDuration: 450, animationDelay: 200, animationFillMode: 'backwards' },
          ]}>
          GOLD<Text style={styles.trans}>TRANS</Text> S.A.S.
        </Animated.Text>
        <Animated.Text
          style={[
            styles.lema,
            !sinMovimiento && { animationName: subir, animationDuration: 450, animationDelay: 350, animationFillMode: 'backwards' },
          ]}>
          Transporte terrestre especial
        </Animated.Text>
        <View style={styles.pista}>
          <Animated.View
            style={[
              styles.barra,
              !sinMovimiento && {
                animationName: recorrer,
                animationDuration: 1100,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  debajo: {
    position: 'absolute',
    top: '50%',
    marginTop: TAMANO_LOGO / 2 + Spacing.md,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  trans: { color: Colors.accentDark },
  lema: { marginTop: Spacing.xs, fontSize: 14, color: Colors.muted },
  pista: {
    width: ANCHO_PISTA,
    height: 4,
    marginTop: Spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  barra: { width: ANCHO_BARRA, height: 4, borderRadius: 2, backgroundColor: Colors.accent },
});
