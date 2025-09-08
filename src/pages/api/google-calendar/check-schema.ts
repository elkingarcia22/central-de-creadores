import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Intentar obtener la estructura de la tabla google_calendar_tokens
    const { data, error } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error obteniendo estructura de tabla:', error);
      return res.status(500).json({ 
        error: 'Error obteniendo estructura de tabla',
        details: error.message 
      });
    }

    // Intentar insertar un registro de prueba para ver qué campos acepta
    const testRecord = {
      user_id: 'test-user-id',
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      created_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('google_calendar_tokens')
      .insert(testRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Error insertando registro de prueba:', insertError);
      return res.status(200).json({
        success: false,
        message: 'No se pudo insertar registro de prueba',
        error: insertError.message,
        test_record: testRecord,
        existing_data: data
      });
    }

    // Si se insertó exitosamente, eliminarlo
    await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', 'test-user-id');

    return res.status(200).json({
      success: true,
      message: 'Estructura de tabla verificada',
      test_record: testRecord,
      insert_result: insertData,
      existing_data: data
    });

  } catch (error) {
    console.error('Error en check-schema:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
