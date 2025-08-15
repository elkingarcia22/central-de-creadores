import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Verificando estructura de tabla usuarios...');

    // Verificar estructura de columnas usando información_schema
    const { data: columnas, error: errorColumnas } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'usuarios')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (errorColumnas) {
      console.error('Error obteniendo estructura:', errorColumnas);
      return res.status(500).json({ error: errorColumnas.message });
    }

    console.log('✅ Estructura de tabla usuarios:', columnas);

    // Verificar si existen las columnas específicas
    const columnasNecesarias = ['correo', 'foto_url', 'activo', 'rol_plataforma'];
    const columnasExistentes = columnas?.map((col: any) => col.column_name) || [];
    
    const estadoColumnas = columnasNecesarias.map(col => ({
      columna: col,
      existe: columnasExistentes.includes(col)
    }));

    // Mostrar algunos registros de ejemplo
    const { data: registros, error: errorRegistros } = await supabase
      .from('usuarios')
      .select('*')
      .limit(3);

    if (errorRegistros) {
      console.error('Error obteniendo registros:', errorRegistros);
    }

    return res.status(200).json({
      estructura: columnas,
      estadoColumnas,
      registrosEjemplo: registros || [],
      columnasExistentes
    });

  } catch (error) {
    console.error('Error verificando estructura:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
