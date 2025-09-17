import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Verificando esquema de transcripciones_sesiones...');

    // Verificar si la tabla existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'transcripciones_sesiones')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('❌ Error obteniendo información de la tabla:', tableError);
      return res.status(500).json({ error: 'Error obteniendo información de la tabla', details: tableError.message });
    }

    console.log('📋 Columnas de transcripciones_sesiones:', tableInfo);

    // Verificar si existe la columna semaforo_riesgo
    const semaforoColumn = tableInfo?.find(col => col.column_name === 'semaforo_riesgo');
    
    if (!semaforoColumn) {
      console.log('❌ La columna semaforo_riesgo NO existe');
      return res.status(200).json({ 
        message: 'La columna semaforo_riesgo NO existe en la tabla transcripciones_sesiones',
        columns: tableInfo,
        needsMigration: true
      });
    }

    console.log('✅ La columna semaforo_riesgo existe:', semaforoColumn);

    // Obtener algunas transcripciones de ejemplo para verificar los datos
    const { data: sampleTranscripciones, error: sampleError } = await supabase
      .from('transcripciones_sesiones')
      .select('id, estado, semaforo_riesgo, created_at')
      .limit(5);

    if (sampleError) {
      console.error('❌ Error obteniendo transcripciones de ejemplo:', sampleError);
      return res.status(500).json({ error: 'Error obteniendo transcripciones de ejemplo', details: sampleError.message });
    }

    console.log('📝 Transcripciones de ejemplo:', sampleTranscripciones);

    return res.status(200).json({
      message: 'Esquema verificado correctamente',
      semaforoColumn,
      allColumns: tableInfo,
      sampleTranscripciones,
      needsMigration: false
    });

  } catch (error) {
    console.error('Error en debug de esquema:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
