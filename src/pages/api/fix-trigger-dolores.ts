import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔧 Endpoint para arreglar trigger de dolores llamado');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST' });
  }

  try {
    console.log('🔧 Ejecutando script para deshabilitar trigger...');

    // 1. Deshabilitar el trigger problemático
    const { error: disableError } = await supabaseServer
      .rpc('exec_sql', { 
        sql_query: 'ALTER TABLE dolores_participantes DISABLE TRIGGER update_dolores_participantes_updated_at;'
      });

    if (disableError) {
      console.error('❌ Error deshabilitando trigger:', disableError);
      
      // Intentar con método alternativo
      console.log('🔧 Intentando método alternativo...');
      
      const { error: altError } = await supabaseServer
        .rpc('exec_sql', { 
          sql_query: `
            DROP TRIGGER IF EXISTS update_dolores_participantes_updated_at ON dolores_participantes;
          `
        });

      if (altError) {
        console.error('❌ Error eliminando trigger:', altError);
        return res.status(500).json({ 
          error: 'No se pudo deshabilitar el trigger',
          details: altError.message
        });
      }
    }

    console.log('✅ Trigger deshabilitado/eliminado exitosamente');

    // 2. Verificar que el trigger está deshabilitado
    const { data: triggerStatus, error: statusError } = await supabaseServer
      .rpc('exec_sql', { 
        sql_query: `
          SELECT 
            schemaname,
            tablename,
            triggername,
            tgisdisabled
          FROM pg_trigger 
          WHERE tgname = 'update_dolores_participantes_updated_at';
        `
      });

    if (statusError) {
      console.log('⚠️ No se pudo verificar estado del trigger, pero continuamos');
    } else {
      console.log('🔍 Estado del trigger:', triggerStatus);
    }

    // 3. Probar una actualización para verificar que funciona
    console.log('🔧 Probando actualización después del fix...');
    
    const { data: testDolores, error: testQueryError } = await supabaseServer
      .from('dolores_participantes')
      .select('id, estado')
      .limit(1);

    if (testQueryError) {
      console.error('❌ Error consultando dolores para prueba:', testQueryError);
      return res.status(500).json({ 
        error: 'Error consultando dolores después del fix',
        details: testQueryError.message
      });
    }

    if (testDolores && testDolores.length > 0) {
      const testDolor = testDolores[0];
      console.log('🔧 Probando actualización con dolor:', testDolor.id);

      const { data: updatedDolor, error: updateError } = await supabaseServer
        .from('dolores_participantes')
        .update({ 
          fecha_actualizacion: new Date().toISOString(),
          estado: testDolor.estado // Mantener el mismo estado
        })
        .eq('id', testDolor.id)
        .select('id, estado, fecha_actualizacion')
        .single();

      if (updateError) {
        console.error('❌ Error en prueba de actualización:', updateError);
        return res.status(500).json({ 
          error: 'La actualización sigue fallando después del fix',
          details: updateError.message,
          code: updateError.code
        });
      }

      console.log('✅ Prueba de actualización exitosa:', updatedDolor);
    }

    return res.status(200).json({
      success: true,
      message: 'Trigger deshabilitado exitosamente',
      details: 'El trigger problemático ha sido deshabilitado y las actualizaciones deberían funcionar ahora'
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return res.status(500).json({ 
      error: 'Error inesperado al arreglar trigger',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
