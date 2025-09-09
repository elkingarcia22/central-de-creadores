import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Verificando estructura de la tabla google_calendar_events');

    // 1. Verificar si la tabla existe y obtener su estructura
    const { data: tableInfo, error: tableError } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accediendo a la tabla:', tableError);
      return res.status(500).json({ 
        error: 'Error accediendo a la tabla google_calendar_events',
        details: tableError.message 
      });
    }

    // 2. Obtener todos los registros para ver la estructura
    const { data: allRecords, error: allRecordsError } = await supabaseServer
      .from('google_calendar_events')
      .select('*');

    if (allRecordsError) {
      console.error('❌ Error obteniendo registros:', allRecordsError);
      return res.status(500).json({ 
        error: 'Error obteniendo registros',
        details: allRecordsError.message 
      });
    }

    // 3. Verificar si hay registros con sesion_id o reclutamiento_id
    const recordsWithSesionId = allRecords?.filter(record => record.sesion_id) || [];
    const recordsWithReclutamientoId = allRecords?.filter(record => record.reclutamiento_id) || [];

    console.log('📊 Análisis de la tabla google_calendar_events:', {
      totalRecords: allRecords?.length || 0,
      recordsWithSesionId: recordsWithSesionId.length,
      recordsWithReclutamientoId: recordsWithReclutamientoId.length,
      sampleRecord: allRecords?.[0] || null
    });

    return res.status(200).json({
      success: true,
      tableStructure: {
        totalRecords: allRecords?.length || 0,
        hasSesionId: recordsWithSesionId.length > 0,
        hasReclutamientoId: recordsWithReclutamientoId.length > 0,
        sampleRecord: allRecords?.[0] || null,
        allRecords: allRecords || []
      },
      recommendation: recordsWithSesionId.length > 0 
        ? 'Usar sesion_id en las consultas'
        : 'Usar reclutamiento_id en las consultas'
    });

  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
