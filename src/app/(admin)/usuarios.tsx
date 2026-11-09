import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { conEntrada, EsqueletoLista } from '@/components/cargando';
import { EstadoVacio } from '@/components/estado-vacio';
import { Mensaje } from '@/components/mensaje';
import { SelectorOpciones } from '@/components/selector-opciones';
import { useToast } from '@/components/toast';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { ETIQUETA_ROL, ROLES_ASIGNABLES, type RolAsignable } from '@/lib/roles';
import {
  actualizarUsuario,
  filtrarUsuarios,
  listarUsuarios,
  type UsuarioConPerfil,
} from '@/lib/usuarios';

const OPCIONES_ROL = ROLES_ASIGNABLES.map((r) => ({ valor: r, texto: ETIQUETA_ROL[r] }));

// HU-08 · Gestionar usuarios: activar, desactivar y cambiar rol.
export default function Usuarios() {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioConPerfil[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [confirmarDesactivar, setConfirmarDesactivar] = useState<string | null>(null);
  const toast = useToast();

  // Cambiar "version" vuelve a consultar la lista.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    listarUsuarios().then((r) => {
      if (!vigente) return;
      setCargando(false);
      if (r.ok) {
        setUsuarios(r.data);
        setError(null);
      } else setError(r.error);
    });
    return () => {
      vigente = false;
    };
  }, [version]);

  function refrescar() {
    setCargando(true);
    setVersion((v) => v + 1);
  }

  async function cambiar(u: UsuarioConPerfil, cambios: { rol?: RolAsignable; activo?: boolean }) {
    setOcupado(u.id);
    const r = await actualizarUsuario(u.id, cambios);
    setOcupado(null);
    setConfirmarDesactivar(null);
    // El mensaje de la cabecera puede quedar fuera de la vista al hacer scroll: se avisa con toast.
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setUsuarios((lista) => lista.map((x) => (x.id === u.id ? { ...x, ...r.data } : x)));
    const nombre = u.perfil?.razon_social || u.perfil?.nombre_completo || u.email;
    toast.exito(
      cambios.rol
        ? `${nombre} ahora es ${ETIQUETA_ROL[cambios.rol]}`
        : cambios.activo
          ? `Cuenta de ${nombre} activada`
          : `Cuenta de ${nombre} desactivada`,
    );
  }

  const visibles = filtrarUsuarios(usuarios, busqueda);

  return (
    <FlatList
      contentContainerStyle={styles.lista}
      data={visibles}
      keyExtractor={(u) => u.id}
      refreshControl={<RefreshControl refreshing={cargando && usuarios.length > 0} onRefresh={refrescar} />}
      ListHeaderComponent={
        <>
          <CampoTexto
            etiqueta="Buscar"
            placeholder="Nombre, correo, NIT o rol"
            autoCapitalize="none"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <Mensaje texto={error} />
        </>
      }
      ListEmptyComponent={
        cargando ? (
          <EsqueletoLista />
        ) : (
          <EstadoVacio icono="people-outline" texto="No hay usuarios que coincidan." />
        )
      }
      renderItem={conEntrada(({ item: u }) => {
        const esYo = u.id === yo?.id;
        const p = u.perfil;
        return (
          <View style={[styles.tarjeta, !u.activo && styles.inactiva]}>
            <Text style={styles.nombre}>{p?.razon_social || p?.nombre_completo || u.email}</Text>
            <Text style={styles.detalle}>{u.email}</Text>
            {p?.tipo_persona === 'empresa' ? (
              <Text style={styles.detalle}>
                NIT {p.nit} · Rep. {p.nombre_completo}
              </Text>
            ) : p?.numero_documento ? (
              <Text style={styles.detalle}>
                {p.tipo_documento} {p.numero_documento}
              </Text>
            ) : null}
            <Text style={[styles.estado, { color: u.activo ? Colors.success : Colors.danger }]}>
              {u.activo ? 'Activo' : 'Desactivado'}
              {esYo ? ' · Tu cuenta' : ''}
            </Text>

            <SelectorOpciones
              opciones={OPCIONES_ROL}
              valor={u.rol as RolAsignable}
              onCambio={(rol) => rol !== u.rol && cambiar(u, { rol })}
              deshabilitado={esYo || ocupado === u.id}
            />
            {esYo ? null : !u.activo ? (
              <Boton titulo="Activar" variante="secundario" cargando={ocupado === u.id} onPress={() => cambiar(u, { activo: true })} />
            ) : confirmarDesactivar === u.id ? (
              <View style={styles.confirmar}>
                <Text style={styles.detalle}>La persona no podrá iniciar sesión hasta que la actives de nuevo.</Text>
                <Boton
                  titulo="Confirmar desactivación"
                  variante="peligro"
                  cargando={ocupado === u.id}
                  onPress={() => cambiar(u, { activo: false })}
                />
                <Boton titulo="No desactivar" variante="texto" onPress={() => setConfirmarDesactivar(null)} disabled={ocupado === u.id} />
              </View>
            ) : (
              <Boton titulo="Desactivar" variante="peligro" onPress={() => setConfirmarDesactivar(u.id)} />
            )}
          </View>
        );
      })}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: Spacing.md, gap: Spacing.md },
  tarjeta: {
    padding: Spacing.md,
    borderRadius: Radius,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  inactiva: { backgroundColor: Colors.surface },
  confirmar: { gap: Spacing.sm },
  nombre: { fontSize: 16, fontWeight: '700', color: Colors.text },
  detalle: { fontSize: 14, color: Colors.muted, marginTop: 2 },
  estado: { fontSize: 13, fontWeight: '600', marginVertical: Spacing.sm },
  vacio: { textAlign: 'center', color: Colors.muted, marginTop: Spacing.lg },
});
