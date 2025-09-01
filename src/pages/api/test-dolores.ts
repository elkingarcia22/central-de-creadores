import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Endpoint de prueba de dolores llamado');
  
  try {
    // 1. Probar conexión básica
    console.log('🔍 Probando conexión con Supabase...');
    const { data: testData, error: testError } = await supabaseServer
      .from('dolores_participantes')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return res.status(500).json({ 
        error: 'Error de conexión con Supabase',
        details: testError.message,
        code: testError.code
      });
    }
    
    console.log('✅ Conexión exitosa');
    
    // 2. Probar consulta de dolores
    console.log('🔍 Probando consulta de dolores...');
    const { data: dolores, error: doloresError } = await supabaseServer
      .from('dolores_participantes')
      .select('id, participante_id, estado, titulo')
      .limit(5);
    
    if (doloresError) {
      console.error('❌ Error consultando dolores:', doloresError);
      return res.status(500).json({ 
        error: 'Error consultando dolores',
        details: doloresError.message,
        code: doloresError.code
      });
    }
    
    console.log('✅ Consulta exitosa, dolores encontrados:', dolores?.length || 0);
    
    // 3. Probar actualización simple
    if (dolores && dolores.length > 0) {
      const primerDolor = dolores[0];
      console.log('🔍 Probando actualización con dolor:', primerDolor.id);
      
      const { data: updatedDolor, error: updateError } = await supabaseServer
        .from('dolores_participantes')
        .update({ 
          fecha_actualizacion: new Date().toISOString(),
          estado: primerDolor.estado // Mantener el mismo estado para evitar problemas
        })
        .eq('id', primerDolor.id)
        .select('id, estado, fecha_actualizacion')
        .single();
      
      if (updateError) {
        console.error('❌ Error en actualización:', updateError);
        return res.status(500).json({ 
          error: 'Error en actualización de prueba',
          details: updateError.message,
          code: updateError.code
        });
      }
      
      console.log('✅ Actualización exitosa:', updatedDolor);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Pruebas completadas exitosamente',
      dolores_count: dolores?.length || 0,
      dolores_sample: dolores?.slice(0, 3) || []
    });
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return res.status(500).json({ 
      error: 'Error inesperado en pruebas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
