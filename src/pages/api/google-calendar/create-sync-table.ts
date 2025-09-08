import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔧 Creando tabla alternativa para sincronización...');

    // Crear una tabla temporal para tracking de sincronización
    const tableName = 'calendar_sync_tracking';
    
    // Intentar crear la tabla usando SQL directo
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        reclutamiento_id UUID NOT NULL,
        google_event_id TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_sync_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Intentar ejecutar el SQL
    const { data: createResult, error: createError } = await supabase
      .rpc('exec_sql', { sql: createTableSQL });

    if (createError) {
      console.log('❌ No se pudo crear tabla con SQL directo:', createError.message);
      
      // Intentar crear registros de prueba para ver si la tabla ya existe
      const testRecord = {
        user_id: '37b272a8-8baa-493c-8877-f14d031e22a1',
        reclutamiento_id: 'efc4cc9f-fdf0-45fb-8241-78044374b1c9',
        google_event_id: 'test_event_' + Date.now(),
        sync_status: 'synced',
        last_sync_at: new Date().toISOString()
      };

      const { data: insertData, error: insertError } = await supabase
        .from(tableName)
        .insert(testRecord)
        .select()
        .single();

      if (insertError) {
        return res.status(200).json({
          success: false,
          message: 'No se pudo crear tabla alternativa',
          create_error: createError.message,
          insert_error: insertError.message,
          recommendation: 'Usar enfoque sin tabla de tracking'
        });
      } else {
        // Eliminar el registro de prueba
        await supabase
          .from(tableName)
          .delete()
          .eq('id', insertData.id);

        return res.status(200).json({
          success: true,
          message: 'Tabla alternativa ya existe y funciona',
          table_name: tableName,
          test_record: insertData
        });
      }
    }

    // Probar la tabla recién creada
    const testRecord = {
      user_id: '37b272a8-8baa-493c-8877-f14d031e22a1',
      reclutamiento_id: 'efc4cc9f-fdf0-45fb-8241-78044374b1c9',
      google_event_id: 'test_event_' + Date.now(),
      sync_status: 'synced',
      last_sync_at: new Date().toISOString()
    };

    const { data: testData, error: testError } = await supabase
      .from(tableName)
      .insert(testRecord)
      .select()
      .single();

    if (testError) {
      return res.status(200).json({
        success: false,
        message: 'Tabla creada pero no funciona',
        create_result: createResult,
        test_error: testError.message
      });
    }

    // Eliminar el registro de prueba
    await supabase
      .from(tableName)
      .delete()
      .eq('id', testData.id);

    return res.status(200).json({
      success: true,
      message: 'Tabla alternativa creada y funcionando',
      table_name: tableName,
      test_record: testData
    });

  } catch (error) {
    console.error('❌ Error creando tabla alternativa:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
