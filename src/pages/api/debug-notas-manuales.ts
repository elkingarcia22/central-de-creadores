import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Verificando estructura de tabla notas_manuales...');

    // Verificar si la tabla existe
    const { data: tables, error: tablesError } = await supabaseServer
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'notas_manuales');

    if (tablesError) {
      console.error('❌ Error verificando tablas:', tablesError);
      return res.status(500).json({ 
        error: 'Error verificando tablas',
        details: tablesError.message 
      });
    }

    console.log('📋 Tablas encontradas:', tables);

    if (!tables || tables.length === 0) {
      return res.status(404).json({ 
        error: 'Tabla notas_manuales no existe',
        suggestion: 'Crear la tabla notas_manuales en Supabase'
      });
    }

    // Verificar estructura de la tabla
    const { data: columns, error: columnsError } = await supabaseServer
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'notas_manuales')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error verificando columnas:', columnsError);
      return res.status(500).json({ 
        error: 'Error verificando columnas',
        details: columnsError.message 
      });
    }

    console.log('📋 Columnas de notas_manuales:', columns);

    // Intentar hacer un SELECT simple
    const { data: sampleData, error: selectError } = await supabaseServer
      .from('notas_manuales')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Error en SELECT:', selectError);
      return res.status(500).json({ 
        error: 'Error en SELECT',
        details: selectError.message,
        columns: columns
      });
    }

    console.log('✅ SELECT exitoso, datos de muestra:', sampleData);

    return res.status(200).json({
      message: 'Tabla notas_manuales existe y es accesible',
      columns: columns,
      sampleData: sampleData
    });

  } catch (error) {
    console.error('❌ Error en debug:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
