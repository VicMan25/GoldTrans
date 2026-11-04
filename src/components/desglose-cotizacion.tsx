import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Duracion, entradaLista } from '@/constants/animaciones';
import { Colors, Spacing } from '@/constants/theme';
import { detalleLinea, formatearPesos, type LineaDesgloseVista } from '@/lib/cotizador';

type Props = { lineas: readonly LineaDesgloseVista[]; valorTotal: number };

/** HU-14 · Desglose de la cotización: tarifa base, km, días, peajes y recargos. */
export function DesgloseCotizacion({ lineas, valorTotal }: Props) {
  return (
    <View>
      {/* Las líneas aparecen una tras otra, como un recibo que se imprime. */}
      {lineas.map((l, i) => {
        const texto = detalleLinea(l);
        return (
          <Animated.View key={l.concepto} entering={entradaLista(i + 1)} style={styles.fila}>
            <View style={styles.concepto}>
              <Text style={styles.descripcion}>{l.descripcion}</Text>
              {texto ? <Text style={styles.detalle}>{texto}</Text> : null}
            </View>
            <Text style={styles.valor}>{formatearPesos(l.subtotal)}</Text>
          </Animated.View>
        );
      })}
      <Animated.View entering={entradaLista(lineas.length + 1)} style={[styles.fila, styles.filaTotal]}>
        <Text style={styles.total}>Total</Text>
        <Animated.Text
          entering={ZoomIn.duration(Duracion.lenta)
            .delay(Math.min(lineas.length + 2, 7) * 50)
            .springify()}
          style={styles.total}>
          {formatearPesos(valorTotal)}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  concepto: { flex: 1 },
  descripcion: { fontSize: 15, color: Colors.text },
  detalle: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  valor: { fontSize: 15, color: Colors.text, fontVariant: ['tabular-nums'] },
  filaTotal: {
    borderBottomWidth: 0,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  total: { fontSize: 18, fontWeight: '800', color: Colors.onPrimary, fontVariant: ['tabular-nums'] },
});
