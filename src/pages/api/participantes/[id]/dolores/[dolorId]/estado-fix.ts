import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id: participanteId, dolorId } = req.query;

  console.log('🔍 Endpoint de estado de dolor (FIX) llamado');
  console.log('🔍 Método:', method);
  console.log('🔍 Participante ID:', participanteId);
  console.log('🔍 Dolor ID:', dolorId);

  if (!participanteId || typeof participanteId !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  if (!dolorId || typeof dolorId !== 'string') {
    return res.status(400).json({ error: 'ID del dolor requerido' });
  }

  if (method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido. Use PATCH' });
  }

  try {
    console.log('🔍 Procesando cambio de estado...');
    console.log('🔍 Request body:', req.body);

    const { estado } = req.body;

    // Validar estado
    if (!estado || !['activo', 'resuelto', 'archivado'].includes(estado)) {
      console.error('❌ Estado inválido:', estado);
      return res.status(400).json({ 
        error: 'Estado válido es requerido (activo, resuelto, archivado)',
        received: estado
      });
    }

    console.log('🔍 Estado válido:', estado);

    // Usar SQL directo para evitar el trigger problemático
    const now = new Date().toISOString();
    let sqlQuery = `
      UPDATE dolores_participantes 
      SET estado = $1, fecha_actualizacion = $2
    `;
    let params = [estado, now];

    // Agregar fecha de resolución si se está marcando como resuelto
    if (estado === 'resuelto') {
      sqlQuery += `, fecha_resolucion = $3`;
      params.push(now);
    }

    sqlQuery += ` WHERE id = $${params.length + 1} AND participante_id = $${params.length + 2} RETURNING *`;
    params.push(dolorId, participanteId);

    console.log('🔍 SQL Query:', sqlQuery);
    console.log('🔍 Params:', params);

    const { data: dolorActualizado, error } = await supabaseServer
      .rpc('exec_sql', { 
        sql_query: sqlQuery,
        sql_params: params 
      });

    if (error) {
      console.error('❌ Error en SQL directo:', error);
      
      // Fallback: intentar con método normal pero sin trigger
      console.log('🔍 Intentando fallback sin trigger...');
      
      const { data: fallbackResult, error: fallbackError } = await supabaseServer
        .from('dolores_participantes')
        .update({
          estado: estado,
          fecha_actualizacion: now,
          ...(estado === 'resuelto' && { fecha_resolucion: now })
        })
        .eq('id', dolorId)
        .eq('participante_id', participanteId)
        .select('id, participante_id, categoria_id, titulo, descripcion, severidad, estado, fecha_creacion, fecha_resolucion, fecha_actualizacion')
        .single();

      if (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return res.status(500).json({ 
          error: 'Error al actualizar estado del dolor',
          details: fallbackError.message || 'Error desconocido de Supabase',
          code: fallbackError.code
        });
      }

      console.log('✅ Estado actualizado exitosamente (fallback)');
      return res.status(200).json({
        success: true,
        message: `Dolor marcado como ${estado} exitosamente`,
        data: fallbackResult
      });
    }

    if (!dolorActualizado || dolorActualizado.length === 0) {
      console.error('❌ No se encontró el dolor después de la actualización');
      return res.status(404).json({ 
        error: 'Dolor no encontrado después de la actualización'
      });
    }

    console.log('✅ Estado actualizado exitosamente (SQL directo)');
    console.log('✅ Dolor actualizado:', dolorActualizado[0]);

    return res.status(200).json({
      success: true,
      message: `Dolor marcado como ${estado} exitosamente`,
      data: dolorActualizado[0]
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
