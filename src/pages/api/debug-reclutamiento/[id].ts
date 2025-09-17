import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de reclutamiento requerido' });
    }

    console.log('🔍 [Debug] Verificando reclutamiento:', id);

    // Verificar si existe el reclutamiento (sin JOIN)
    const { data: reclutamiento, error: reclutamientoError } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .eq('id', id)
      .single();

    // Si existe el reclutamiento, cargar la investigación por separado
    let investigacion = null;
    if (reclutamiento && !reclutamientoError) {
      const { data: invData, error: invError } = await supabaseServer
        .from('investigaciones')
        .select(`
          *,
          libretos_investigacion (*)
        `)
        .eq('id', reclutamiento.investigacion_id)
        .single();
      
      if (!invError && invData) {
        investigacion = invData;
      }
    }

    if (reclutamientoError) {
      console.log('❌ [Debug] Error buscando reclutamiento:', reclutamientoError);
      return res.status(404).json({ 
        error: 'Reclutamiento no encontrado',
        details: reclutamientoError.message,
        code: reclutamientoError.code
      });
    }

    if (!reclutamiento) {
      console.log('❌ [Debug] Reclutamiento no encontrado');
      return res.status(404).json({ 
        error: 'Reclutamiento no encontrado',
        found: false
      });
    }

    console.log('✅ [Debug] Reclutamiento encontrado:', reclutamiento);

    // Verificar transcripciones
    const { data: transcripciones, error: transcripcionesError } = await supabaseServer
      .from('transcripciones_sesiones')
      .select('*')
      .eq('reclutamiento_id', id);

    // Verificar notas manuales
    const { data: notasManuales, error: notasError } = await supabaseServer
      .from('notas_manuales')
      .select('*')
      .eq('sesion_id', id);

    return res.status(200).json({
      status: 'ok',
      reclutamiento: {
        id: reclutamiento.id,
        investigacion_id: reclutamiento.investigacion_id,
        participantes_id: reclutamiento.participantes_id,
        investigacion: investigacion?.nombre,
        libreto: investigacion?.libretos_investigacion
      },
      transcripciones: {
        cantidad: transcripciones?.length || 0,
        error: transcripcionesError?.message,
        datos: transcripciones?.map(t => ({
          id: t.id,
          estado: t.estado,
          tiene_transcripcion: !!t.transcripcion_completa,
          longitud: t.transcripcion_completa?.length || 0
        }))
      },
      notas_manuales: {
        cantidad: notasManuales?.length || 0,
        error: notasError?.message,
        datos: notasManuales?.map(n => ({
          id: n.id,
          contenido: n.contenido?.substring(0, 100) + '...',
          fecha: n.fecha_creacion
        }))
      }
    });

  } catch (error) {
    console.error('❌ [Debug] Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
