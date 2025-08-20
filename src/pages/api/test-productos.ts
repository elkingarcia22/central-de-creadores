import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 TEST - Verificando tabla productos...');

      // 1. Verificar si podemos acceder a la tabla
      console.log('📋 Paso 1: Verificando acceso a la tabla...');
      const { data: productos, error: errorProductos } = await supabaseServer
        .from('productos')
        .select('*')
        .limit(5);

      console.log('📊 Resultado productos:', { productos, error: errorProductos });

      // 2. Verificar si hay productos activos
      console.log('📋 Paso 2: Verificando productos activos...');
      const { data: productosActivos, error: errorActivos } = await supabaseServer
        .from('productos')
        .select('*')
        .eq('activo', true)
        .limit(5);

      console.log('📊 Resultado productos activos:', { productosActivos, error: errorActivos });

      // 3. Verificar si hay productos inactivos
      console.log('📋 Paso 3: Verificando productos inactivos...');
      const { data: productosInactivos, error: errorInactivos } = await supabaseServer
        .from('productos')
        .select('*')
        .eq('activo', false)
        .limit(5);

      console.log('📊 Resultado productos inactivos:', { productosInactivos, error: errorInactivos });

      // 4. Verificar estructura de la tabla
      console.log('📋 Paso 4: Verificando estructura...');
      let estructura = null;
      let errorEstructura = null;
      try {
        const result = await supabaseServer.rpc('get_table_info', { table_name: 'productos' });
        estructura = result.data;
        errorEstructura = result.error;
      } catch (error) {
        errorEstructura = 'Función no disponible';
      }

      console.log('📊 Resultado estructura:', { estructura, error: errorEstructura });

      const diagnostico = {
        timestamp: new Date().toISOString(),
        productos: {
          todos: productos || [],
          activos: productosActivos || [],
          inactivos: productosInactivos || [],
          totalTodos: productos?.length || 0,
          totalActivos: productosActivos?.length || 0,
          totalInactivos: productosInactivos?.length || 0
        },
        errores: {
          productos: errorProductos,
          activos: errorActivos,
          inactivos: errorInactivos,
          estructura: errorEstructura
        },
        resumen: {
          hayProductos: (productos && productos.length > 0),
          hayActivos: (productosActivos && productosActivos.length > 0),
          hayInactivos: (productosInactivos && productosInactivos.length > 0)
        }
      };

      console.log('✅ Diagnóstico completado:', diagnostico.resumen);

      return res.status(200).json({
        success: true,
        message: 'Diagnóstico completado',
        data: diagnostico
      });

    } catch (error) {
      console.error('❌ Error en test productos:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
