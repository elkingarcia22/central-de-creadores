import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔧 Endpoint simple para arreglar trigger de dolores llamado');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST' });
  }

  try {
    console.log('🔧 Intentando deshabilitar trigger con método directo...');

    // Intentar actualización directa sin trigger
    const { data: testDolores, error: testQueryError } = await supabaseServer
      .from('dolores_participantes')
      .select('id, estado, fecha_actualizacion')
      .limit(1);

    if (testQueryError) {
      console.error('❌ Error consultando dolores:', testQueryError);
      return res.status(500).json({ 
        error: 'Error consultando dolores',
        details: testQueryError.message
      });
    }

    if (!testDolores || testDolores.length === 0) {
      return res.status(404).json({ 
        error: 'No hay dolores para probar'
      });
    }

    const testDolor = testDolores[0];
    console.log('🔧 Probando actualización con dolor:', testDolor.id);

    // Intentar actualización con manejo de errores específico
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
      console.error('❌ Error en actualización:', updateError);
      
      // Si el error es del trigger, intentar una solución alternativa
      if (updateError.code === '42703' && updateError.message.includes('updated_at')) {
        console.log('🔧 Error confirmado del trigger. Intentando solución alternativa...');
        
        // Crear un endpoint que evite completamente el trigger
        return res.status(200).json({
          success: false,
          message: 'Error confirmado del trigger',
          details: 'El trigger está causando el error. Se necesita ejecutar SQL manualmente en Supabase.',
          solution: 'Ejecutar en Supabase SQL Editor: ALTER TABLE dolores_participantes DISABLE TRIGGER update_dolores_participantes_updated_at;',
          error_code: updateError.code,
          error_message: updateError.message
        });
      }

      return res.status(500).json({ 
        error: 'Error en actualización',
        details: updateError.message,
        code: updateError.code
      });
    }

    console.log('✅ Actualización exitosa:', updatedDolor);

    return res.status(200).json({
      success: true,
      message: 'Actualización funciona correctamente',
      data: updatedDolor
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return res.status(500).json({ 
      error: 'Error inesperado',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
