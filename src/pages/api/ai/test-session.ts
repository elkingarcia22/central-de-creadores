import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [AI Test Session] Buscando sesiones disponibles...');

    // Buscar sesiones con transcripciones
    const { data: sesiones, error: sesionesError } = await supabaseServer
      .from('sesiones')
      .select('id, nombre, fecha_sesion, investigacion_id')
      .limit(5);

    if (sesionesError) {
      console.error('❌ [AI Test Session] Error cargando sesiones:', sesionesError);
      return res.status(500).json({ error: 'Error cargando sesiones' });
    }

    // Para cada sesión, verificar si tiene transcripciones
    const sesionesConDatos = [];
    
    for (const sesion of sesiones || []) {
      // Verificar transcripciones
      const { data: transcripciones } = await supabaseServer
        .from('transcripciones_sesiones')
        .select('id, estado, transcripcion_completa')
        .eq('reclutamiento_id', sesion.id)
        .or(`sesion_apoyo_id.eq.${sesion.id}`)
        .limit(1);

      // Verificar notas manuales
      const { data: notas } = await supabaseServer
        .from('notas_manuales')
        .select('id, contenido')
        .eq('sesion_id', sesion.id)
        .limit(1);

      sesionesConDatos.push({
        id: sesion.id,
        nombre: sesion.nombre,
        fecha_sesion: sesion.fecha_sesion,
        investigacion_id: sesion.investigacion_id,
        tiene_transcripcion: transcripciones && transcripciones.length > 0,
        tiene_notas: notas && notas.length > 0,
        transcripcion_estado: transcripciones?.[0]?.estado,
        transcripcion_length: transcripciones?.[0]?.transcripcion_completa?.length || 0,
        notas_count: notas?.length || 0
      });
    }

    console.log('✅ [AI Test Session] Sesiones encontradas:', sesionesConDatos.length);

    return res.status(200).json({
      status: 'ok',
      message: 'Sesiones disponibles para análisis',
      sesiones: sesionesConDatos,
      total: sesionesConDatos.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [AI Test Session] Error:', error);
    return res.status(500).json({ 
      error: 'Error buscando sesiones',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
