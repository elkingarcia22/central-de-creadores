import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  console.log('🔍 API reclutamiento-actual - ID participante:', id);
  console.log('🔍 Variables de entorno:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Existe' : '❌ No existe');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Existe' : '❌ No existe');

  try {
    // PASO 1: Verificar que el participante existe en todas las tablas posibles
    console.log('🔍 PASO 1: Verificando participante en todas las tablas...');
    
    let participante = null;
    let tipoParticipante = 'no_encontrado';
    
    // Buscar en participantes (externos)
    const { data: participanteExterno, error: errorExterno } = await supabase
      .from('participantes')
      .select('id, nombre, tipo')
      .eq('id', id)
      .single();
    
    if (!errorExterno && participanteExterno) {
      participante = participanteExterno;
      tipoParticipante = 'externo';
      console.log('✅ Participante externo encontrado:', participante);
    } else {
      // Buscar en participantes_internos
      const { data: participanteInterno, error: errorInterno } = await supabase
        .from('participantes_internos')
        .select('id, nombre')
        .eq('id', id)
        .single();
      
      if (!errorInterno && participanteInterno) {
        participante = participanteInterno;
        tipoParticipante = 'interno';
        console.log('✅ Participante interno encontrado:', participante);
      } else {
        // Buscar en participantes_friend_family
        const { data: participanteFriendFamily, error: errorFriendFamily } = await supabase
          .from('participantes_friend_family')
          .select('id, nombre')
          .eq('id', id)
          .single();
        
        if (!errorFriendFamily && participanteFriendFamily) {
          participante = participanteFriendFamily;
          tipoParticipante = 'friend_family';
          console.log('✅ Participante friend & family encontrado:', participante);
        }
      }
    }
    
    if (!participante) {
      console.error('❌ Participante no encontrado en ninguna tabla');
      return res.status(404).json({ error: 'Participante no encontrado' });
    }
    
    console.log('✅ Participante encontrado:', participante, 'Tipo:', tipoParticipante);

    // PASO 2: Buscar reclutamientos en todas las columnas posibles según el tipo
    console.log('🔍 PASO 2: Buscando reclutamientos según tipo:', tipoParticipante);
    
    let reclutamientos = [];
    let reclutamientosError = null;
    
    if (tipoParticipante === 'externo') {
      // Para externos, buscar en participantes_id
      const { data: data, error: error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_id', id);
      
      reclutamientos = data || [];
      reclutamientosError = error;
    } else if (tipoParticipante === 'interno') {
      // Para internos, buscar en participantes_internos_id
      const { data: data, error: error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_internos_id', id);
      
      reclutamientos = data || [];
      reclutamientosError = error;
    } else if (tipoParticipante === 'friend_family') {
      // Para friend & family, buscar en participantes_friend_family_id
      const { data: data, error: error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_friend_family_id', id);
      
      reclutamientos = data || [];
      reclutamientosError = error;
    }

    if (reclutamientosError) {
      console.error('❌ Error consultando reclutamientos:', reclutamientosError);
      return res.status(500).json({ error: 'Error consultando reclutamientos' });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos);

    if (!reclutamientos || reclutamientos.length === 0) {
      console.log('⚠️ No hay reclutamientos para este participante. Devolviendo datos básicos...');
      
      // Para participantes sin reclutamientos, devolver datos básicos
      const participanteBasico = {
        id: participante.id,
        nombre: participante.nombre,
        descripcion: 'Sin descripción',
        fecha_inicio: null,
        fecha_sesion: null,
        duracion_sesion: 0,
        estado: 'Sin estado',
        responsable: 'Sin responsable',
        implementador: 'Sin implementador',
        tipo_investigacion: 'Sin tipo',
        fecha_asignado: null,
        estado_agendamiento: null,
        reclutador_id: null,
        creado_por: null,
        tipo_participante: tipoParticipante,
        sin_reclutamientos: true
      };
      
      return res.status(200).json({
        reclutamiento: participanteBasico
      });
    }

    // PASO 3: Tomar el más reciente
    const reclutamiento = reclutamientos[0];
    console.log('✅ Reclutamiento seleccionado:', reclutamiento);

    // PASO 4: Buscar investigación asociada
    let investigacion = null;
    if (reclutamiento.investigacion_id) {
      console.log('🔍 PASO 4: Buscando investigación...');
      const { data: inv, error: invError } = await supabase
        .from('investigaciones')
        .select('*')
        .eq('id', reclutamiento.investigacion_id)
        .single();

      if (invError) {
        console.error('❌ Error consultando investigación:', invError);
      } else {
        investigacion = inv;
        console.log('✅ Investigación encontrada:', investigacion);
      }
    }

    // PASO 5: Buscar usuarios responsables
    let responsableNombre = 'Sin responsable';
    let implementadorNombre = 'Sin implementador';

    if (investigacion?.responsable_id) {
      console.log('🔍 PASO 5: Buscando responsable...');
      console.log('🔍 ID del responsable:', investigacion.responsable_id);
      
      const { data: responsableData, error: responsableError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', investigacion.responsable_id)
        .single();

      if (responsableError) {
        console.error('❌ Error consultando responsable:', responsableError);
      } else if (responsableData) {
        console.log('🔍 Datos del responsable:', responsableData);
        responsableNombre = responsableData.nombre || 'Sin nombre';
        console.log('✅ Responsable encontrado:', responsableNombre);
      }
    }

    if (investigacion?.implementador_id) {
      console.log('🔍 PASO 6: Buscando implementador...');
      console.log('🔍 ID del implementador:', investigacion.implementador_id);
      
      const { data: implementadorData, error: implementadorError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', investigacion.implementador_id)
        .single();

      if (implementadorError) {
        console.error('❌ Error consultando implementador:', implementadorError);
      } else if (implementadorData) {
        console.log('🔍 Datos del implementador:', implementadorData);
        implementadorNombre = implementadorData.nombre || 'Sin nombre';
        console.log('✅ Implementador encontrado:', implementadorNombre);
      }
    }

    // PASO 7: Formatear respuesta
    const reclutamientoFormateado = {
      id: reclutamiento.id,
      nombre: investigacion?.nombre || 'Sin nombre',
      descripcion: investigacion?.descripcion || 'Sin descripción',
      fecha_inicio: investigacion?.fecha_inicio || reclutamiento.fecha_sesion,
      fecha_sesion: reclutamiento.fecha_sesion,
      duracion_sesion: reclutamiento.duracion_sesion || 60,
      estado: investigacion?.estado || 'Sin estado',
      responsable: responsableNombre,
      implementador: implementadorNombre,
      tipo_investigacion: 'Sin tipo',
      fecha_asignado: reclutamiento.fecha_asignado,
      estado_agendamiento: reclutamiento.estado_agendamiento,
      reclutador_id: reclutamiento.reclutador_id,
      creado_por: reclutamiento.creado_por
    };

    console.log('✅ Respuesta final formateada:', reclutamientoFormateado);

    return res.status(200).json({
      reclutamiento: reclutamientoFormateado
    });

  } catch (error) {
    console.error('💥 Error general en API:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
