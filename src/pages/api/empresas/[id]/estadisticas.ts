import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de empresa requerido' });
  }

  try {
    console.log(`🔍 Obteniendo estadísticas para empresa: ${id}`);

    // 1. Obtener información básica de la empresa
    console.log(`🔍 Buscando empresa con ID: ${id}`);
    const { data: empresa, error: errorEmpresa } = await supabaseServer
      .from('empresas')
      .select(`
        id,
        nombre,
        descripcion,
        kam_id,
        pais,
        estado,
        "tamaño",
        relacion,
        modalidad,
        industria,
        producto_id,
        activo,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();
    
    console.log('📊 Resultado consulta empresa:', { empresa, error: errorEmpresa });

    if (errorEmpresa || !empresa) {
      console.error('❌ Error obteniendo empresa:', errorEmpresa);
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // Obtener datos relacionados por separado
    let kamData = null;
    let paisData = null;
    let estadoData = null;
    let tamanoData = null;
    let relacionData = null;
    let modalidadData = null;
    let industriaData = null;
    let productoData = null;

    if (empresa.kam_id) {
      const { data: kam } = await supabaseServer
        .from('usuarios')
        .select('id, nombre, correo')
        .eq('id', empresa.kam_id)
        .single();
      kamData = kam;
    }

    if (empresa.pais) {
      const { data: pais } = await supabaseServer
        .from('paises')
        .select('id, nombre')
        .eq('id', empresa.pais)
        .single();
      paisData = pais;
    }

    if (empresa.estado) {
      const { data: estado } = await supabaseServer
        .from('estados')
        .select('id, nombre')
        .eq('id', empresa.estado)
        .single();
      estadoData = estado;
    }

    if (empresa['tamaño']) {
      const { data: tamano } = await supabaseServer
        .from('tamanos')
        .select('id, nombre')
        .eq('id', empresa['tamaño'])
        .single();
      tamanoData = tamano;
    }

    if (empresa.relacion) {
      const { data: relacion } = await supabaseServer
        .from('relaciones')
        .select('id, nombre')
        .eq('id', empresa.relacion)
        .single();
      relacionData = relacion;
    }

    if (empresa.modalidad) {
      const { data: modalidad } = await supabaseServer
        .from('modalidades')
        .select('id, nombre')
        .eq('id', empresa.modalidad)
        .single();
      modalidadData = modalidad;
    }

    if (empresa.industria) {
      const { data: industria } = await supabaseServer
        .from('industrias')
        .select('id, nombre')
        .eq('id', empresa.industria)
        .single();
      industriaData = industria;
    }

    if (empresa.producto_id) {
      const { data: producto } = await supabaseServer
        .from('productos')
        .select('id, nombre')
        .eq('id', empresa.producto_id)
        .single();
      productoData = producto;
    }

    // 2. Obtener participantes de esta empresa
    const { data: participantes, error: errorParticipantes } = await supabaseServer
      .from('participantes')
      .select('id, nombre, rol_empresa_id, fecha_ultima_participacion, total_participaciones')
      .eq('empresa_id', id);

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return res.status(500).json({ error: 'Error obteniendo participantes' });
    }

    // 3. Obtener reclutamientos finalizados con información de investigaciones
    const participanteIds = participantes?.map(p => p.id) || [];
    
    let reclutamientosFinalizados: any[] = [];
    let ultimaParticipacion = null;
    let investigacionesParticipadas: any[] = [];

    if (participanteIds.length > 0) {
      // Obtener el ID del estado "Finalizado"
      const { data: estadosData } = await supabaseServer
        .from('estado_agendamiento_cat')
        .select('id, nombre')
        .ilike('nombre', '%finalizado%');
      
      const estadoFinalizadoId = estadosData?.[0]?.id;

      if (estadoFinalizadoId) {
        // Obtener reclutamientos finalizados con información completa
        const { data: reclutamientos, error: errorReclutamientos } = await supabaseServer
          .from('reclutamientos')
          .select(`
            id,
            investigacion_id,
            participantes_id,
            fecha_sesion,
            duracion_sesion,
            estado_agendamiento,
            investigacion:investigaciones!reclutamientos_investigacion_id_fkey(
              id,
              nombre,
              descripcion,
              fecha_inicio,
              fecha_fin,
              estado,
              tipo_sesion,
              riesgo_automatico
            )
          `)
          .eq('estado_agendamiento', estadoFinalizadoId)
          .in('participantes_id', participanteIds)
          .order('fecha_sesion', { ascending: false });

        if (!errorReclutamientos && reclutamientos) {
          reclutamientosFinalizados = reclutamientos;
          
          // Obtener la fecha de la última participación
          if (reclutamientos.length > 0) {
            ultimaParticipacion = reclutamientos[0].fecha_sesion;
          }

          // Obtener investigaciones únicas en las que ha participado
          const investigacionesIds = [...new Set(reclutamientos.map(r => r.investigacion_id))];
          
          if (investigacionesIds.length > 0) {
            const { data: investigaciones, error: errorInvestigaciones } = await supabaseServer
              .from('investigaciones')
              .select(`
                id,
                nombre,
                descripcion,
                fecha_inicio,
                fecha_fin,
                estado,
                tipo_sesion,
                riesgo_automatico,
                responsable:profiles!investigaciones_responsable_id_fkey(id, full_name, email),
                implementador:profiles!investigaciones_implementador_id_fkey(id, full_name, email)
              `)
              .in('id', investigacionesIds)
              .order('fecha_inicio', { ascending: false });

            if (!errorInvestigaciones && investigaciones) {
              investigacionesParticipadas = investigaciones;
            }
          }
        }
      }
    }

    // 4. Calcular estadísticas
    const estadisticas = {
      totalParticipaciones: reclutamientosFinalizados.length,
      totalParticipantes: participantes?.length || 0,
      fechaUltimaParticipacion: ultimaParticipacion,
      investigacionesParticipadas: investigacionesParticipadas.length,
      duracionTotalSesiones: reclutamientosFinalizados.reduce((total, r) => total + (r.duracion_sesion || 60), 0),
      participacionesPorMes: calcularParticipacionesPorMes(reclutamientosFinalizados),
      investigaciones: investigacionesParticipadas.map(inv => ({
        id: inv.id,
        nombre: inv.nombre,
        descripcion: inv.descripcion,
        fecha_inicio: inv.fecha_inicio,
        fecha_fin: inv.fecha_fin,
        estado: inv.estado,
        tipo_sesion: inv.tipo_sesion,
        riesgo_automatico: inv.riesgo_automatico,
        responsable: inv.responsable,
        implementador: inv.implementador,
        participaciones: reclutamientosFinalizados.filter(r => r.investigacion_id === inv.id).length
      }))
    };

    // 5. Formatear respuesta
    const empresaFormateada = {
      id: empresa.id,
      nombre: empresa.nombre,
      descripcion: empresa.descripcion,
      kam_id: empresa.kam_id,
      kam_nombre: kamData?.nombre,
      kam_email: kamData?.correo,
      pais_id: empresa.pais,
      pais_nombre: paisData?.nombre,
      estado_id: empresa.estado,
      estado_nombre: estadoData?.nombre,
      tamano_id: empresa['tamaño'],
      tamano_nombre: tamanoData?.nombre,
      relacion_id: empresa.relacion,
      relacion_nombre: relacionData?.nombre,
      modalidad_id: empresa.modalidad,
      modalidad_nombre: modalidadData?.nombre,
      industria_id: empresa.industria,
      industria_nombre: industriaData?.nombre,
      producto_id: empresa.producto_id,
      producto_nombre: productoData?.nombre,
      activo: empresa.activo,
      created_at: empresa.created_at,
      updated_at: empresa.updated_at
    };

    console.log(`✅ Estadísticas obtenidas para empresa ${id}:`, {
      totalParticipaciones: estadisticas.totalParticipaciones,
      totalParticipantes: estadisticas.totalParticipantes,
      investigacionesParticipadas: estadisticas.investigacionesParticipadas
    });

    return res.status(200).json({
      empresa: empresaFormateada,
      estadisticas,
      participantes: participantes || []
    });

  } catch (error) {
    console.error('❌ Error en la API de estadísticas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función auxiliar para calcular participaciones por mes
function calcularParticipacionesPorMes(reclutamientos: any[]) {
  const participacionesPorMes: { [key: string]: number } = {};
  
  reclutamientos.forEach(reclutamiento => {
    if (reclutamiento.fecha_sesion) {
      const fecha = new Date(reclutamiento.fecha_sesion);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      participacionesPorMes[mesAnio] = (participacionesPorMes[mesAnio] || 0) + 1;
    }
  });

  return participacionesPorMes;
}
