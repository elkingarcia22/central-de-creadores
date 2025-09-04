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

  console.log('🔍 DEBUG COMPLETO - ID participante:', id);

  try {
    // PASO 1: Verificar en todas las tablas de participantes
    console.log('🔍 PASO 1: Verificando en todas las tablas de participantes...');
    
    let participante = null;
    let tipoParticipante = 'no_encontrado';
    let tablaEncontrada = 'ninguna';
    
    // Buscar en participantes (externos)
    const { data: participanteExterno, error: errorExterno } = await supabase
      .from('participantes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!errorExterno && participanteExterno) {
      participante = participanteExterno;
      tipoParticipante = 'externo';
      tablaEncontrada = 'participantes';
      console.log('✅ Participante externo encontrado en tabla participantes');
    } else {
      // Buscar en participantes_internos
      const { data: participanteInterno, error: errorInterno } = await supabase
        .from('participantes_internos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!errorInterno && participanteInterno) {
        participante = participanteInterno;
        tipoParticipante = 'interno';
        tablaEncontrada = 'participantes_internos';
        console.log('✅ Participante interno encontrado en tabla participantes_internos');
      } else {
        // Buscar en participantes_friend_family
        const { data: participanteFriendFamily, error: errorFriendFamily } = await supabase
          .from('participantes_friend_family')
          .select('*')
          .eq('id', id)
          .single();
        
        if (!errorFriendFamily && participanteFriendFamily) {
          participante = participanteFriendFamily;
          tipoParticipante = 'friend_family';
          tablaEncontrada = 'participantes_friend_family';
          console.log('✅ Participante friend & family encontrado en tabla participantes_friend_family');
        }
      }
    }
    
    if (!participante) {
      console.log('❌ Participante no encontrado en ninguna tabla');
      return res.status(404).json({ 
        error: 'Participante no encontrado',
        debug: {
          id,
          tablasVerificadas: ['participantes', 'participantes_internos', 'participantes_friend_family'],
          errores: {
            participantes: errorExterno?.message,
            participantes_internos: errorInterno?.message,
            participantes_friend_family: errorFriendFamily?.message
          }
        }
      });
    }
    
    console.log('✅ Participante encontrado:', {
      id: participante.id,
      nombre: participante.nombre,
      tipo: tipoParticipante,
      tabla: tablaEncontrada
    });

    // PASO 2: Buscar reclutamientos en todas las columnas posibles
    console.log('🔍 PASO 2: Buscando reclutamientos...');
    
    let reclutamientos = [];
    let reclutamientosError = null;
    
    if (tipoParticipante === 'externo') {
      const { data: data, error: error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_id', id);
      
      reclutamientos = data || [];
      reclutamientosError = error;
    } else if (tipoParticipante === 'interno') {
      const { data: data, error: error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_internos_id', id);
      
      reclutamientos = data || [];
      reclutamientosError = error;
    } else if (tipoParticipante === 'friend_family') {
      const { data: data, error: error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_friend_family_id', id);
      
      reclutamientos = data || [];
      reclutamientosError = error;
    }

    if (reclutamientosError) {
      console.error('❌ Error consultando reclutamientos:', reclutamientosError);
    } else {
      console.log('✅ Reclutamientos encontrados:', reclutamientos.length);
    }

    // PASO 3: Buscar investigaciones asociadas
    console.log('🔍 PASO 3: Buscando investigaciones...');
    let investigaciones = [];
    
    if (reclutamientos && reclutamientos.length > 0) {
      const investigacionIds = reclutamientos.map(r => r.investigacion_id).filter(Boolean);
      
      if (investigacionIds.length > 0) {
        const { data: invs, error: invError } = await supabase
          .from('investigaciones')
          .select('*')
          .in('id', investigacionIds);

        if (invError) {
          console.error('❌ Error consultando investigaciones:', invError);
        } else {
          investigaciones = invs || [];
          console.log('✅ Investigaciones encontradas:', investigaciones.length);
        }
      }
    }

    // PASO 4: Buscar usuarios responsables
    console.log('🔍 PASO 4: Buscando usuarios responsables...');
    let usuarios = [];
    
    if (investigaciones.length > 0) {
      const usuarioIds = investigaciones
        .map(inv => [inv.responsable_id, inv.implementador_id])
        .flat()
        .filter(Boolean);

      if (usuarioIds.length > 0) {
        const { data: usrs, error: usrError } = await supabase
          .from('usuarios')
          .select('*')
          .in('id', usuarioIds);

        if (usrError) {
          console.error('❌ Error consultando usuarios:', usrError);
        } else {
          usuarios = usrs || [];
          console.log('✅ Usuarios encontrados:', usuarios.length);
        }
      }
    }

    // PASO 5: Verificar si hay datos en caché o estado persistente
    console.log('🔍 PASO 5: Verificando posibles fuentes de datos incorrectos...');
    
    // Buscar en la vista de estadísticas (que puede tener datos históricos)
    const { data: estadisticas, error: errorEstadisticas } = await supabase
      .from('vista_estadisticas_participantes')
      .select('*')
      .eq('participante_id', id);

    if (errorEstadisticas) {
      console.log('⚠️ Vista de estadísticas no disponible o con error');
    } else {
      console.log('✅ Vista de estadísticas encontrada:', estadisticas?.length || 0);
    }

    // RESPUESTA COMPLETA
    return res.status(200).json({
      debug: {
        participante: {
          ...participante,
          tipo: tipoParticipante,
          tablaEncontrada
        },
        reclutamientos,
        investigaciones,
        usuarios,
        estadisticas,
        resumen: {
          tipoEncontrado: tipoParticipante,
          totalReclutamientos: reclutamientos?.length || 0,
          totalInvestigaciones: investigaciones?.length || 0,
          totalUsuarios: usuarios?.length || 0,
          totalEstadisticas: estadisticas?.length || 0,
          tieneReclutamientos: (reclutamientos?.length || 0) > 0,
          tieneInvestigaciones: (investigaciones?.length || 0) > 0,
          tieneEstadisticas: (estadisticas?.length || 0) > 0
        }
      }
    });

  } catch (error) {
    console.error('💥 Error general en debug completo:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
