import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔧 Iniciando verificación y corrección del esquema...');

    // 1. Verificar si existe la tabla 'sesiones'
    const { data: sesionesData, error: sesionesError } = await supabase
      .from('sesiones')
      .select('id')
      .limit(1);

    console.log('🔍 Tabla sesiones:', sesionesError ? 'No existe' : 'Existe', sesionesError?.message);

    // 2. Verificar la estructura de google_calendar_events
    const { data: eventsData, error: eventsError } = await supabase
      .from('google_calendar_events')
      .select('*')
      .limit(1);

    console.log('🔍 Estructura google_calendar_events:', eventsError?.message || 'OK');

    // 3. Intentar crear un registro de prueba con diferentes enfoques
    const testApproaches = [
      {
        name: 'Con ID de reclutamiento existente',
        sesion_id: 'efc4cc9f-fdf0-45fb-8241-78044374b1c9', // ID del reclutamiento que acabamos de crear
        description: 'Usando ID de reclutamiento real'
      },
      {
        name: 'Con ID de sesión si existe',
        sesion_id: 'test-sesion-id',
        description: 'Usando ID de sesión de prueba'
      }
    ];

    const results = [];

    for (const approach of testApproaches) {
      try {
        const testRecord = {
          user_id: '37b272a8-8baa-493c-8877-f14d031e22a1',
          sesion_id: approach.sesion_id,
          google_event_id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          google_calendar_id: 'primary',
          sync_status: 'synced',
          last_sync_at: new Date().toISOString()
        };

        console.log(`🧪 Probando enfoque: ${approach.name}`);

        const { data, error } = await supabase
          .from('google_calendar_events')
          .insert(testRecord)
          .select()
          .single();

        if (error) {
          results.push({
            approach: approach.name,
            success: false,
            error: error.message,
            code: error.code,
            details: error.details
          });
        } else {
          results.push({
            approach: approach.name,
            success: true,
            data: data
          });

          // Eliminar el registro de prueba
          await supabase
            .from('google_calendar_events')
            .delete()
            .eq('id', data.id);
        }
      } catch (err) {
        results.push({
          approach: approach.name,
          success: false,
          error: err instanceof Error ? err.message : 'Error desconocido'
        });
      }
    }

    // 4. Verificar si podemos crear la tabla sesiones si no existe
    let sesionesTableCreated = false;
    if (sesionesError && sesionesError.message.includes('does not exist')) {
      console.log('🔧 Intentando crear tabla sesiones...');
      
      // Intentar insertar un registro en sesiones para crear la tabla
      try {
        const { data, error } = await supabase
          .from('sesiones')
          .insert({
            id: 'test-sesion-id',
            nombre: 'Sesión de prueba',
            fecha: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!error) {
          sesionesTableCreated = true;
          console.log('✅ Tabla sesiones creada exitosamente');
          
          // Eliminar el registro de prueba
          await supabase
            .from('sesiones')
            .delete()
            .eq('id', 'test-sesion-id');
        }
      } catch (err) {
        console.log('❌ No se pudo crear tabla sesiones:', err);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Verificación del esquema completada',
      schema_analysis: {
        sesiones_table_exists: !sesionesError,
        sesiones_error: sesionesError?.message,
        google_calendar_events_structure: eventsError?.message || 'OK',
        sesiones_table_created: sesionesTableCreated
      },
      test_results: results,
      recommendation: results.some(r => r.success) 
        ? 'Al menos un enfoque funcionó. Usar el enfoque exitoso.'
        : 'Ningún enfoque funcionó. Revisar la configuración de la base de datos.'
    });

  } catch (error) {
    console.error('❌ Error en fix-schema:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
