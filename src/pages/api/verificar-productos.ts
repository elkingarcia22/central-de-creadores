import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Verificando tabla productos...');

      // 1. VERIFICAR SI EXISTE LA TABLA
      console.log('📋 Verificando existencia de la tabla...');
      const { data: productos, error: errorProductos } = await supabase
        .from('productos')
        .select('*')
        .order('nombre');

      if (errorProductos) {
        console.error('❌ Error al obtener productos:', errorProductos);
        return res.status(500).json({ 
          error: 'Error al obtener productos', 
          details: errorProductos 
        });
      }

      console.log('✅ Productos obtenidos:', productos);

      // 2. VERIFICAR ESTRUCTURA
      const estructura = productos && productos.length > 0 ? Object.keys(productos[0]) : [];
      
      const diagnostico = {
        tablaExiste: true,
        totalProductos: productos?.length || 0,
        estructura: estructura,
        productos: productos || [],
        resumen: {
          hayProductos: (productos && productos.length > 0),
          primerProducto: productos?.[0] || null,
          ultimoProducto: productos?.[productos.length - 1] || null
        }
      };

      console.log('✅ Diagnóstico completado:', diagnostico.resumen);

      return res.status(200).json({
        success: true,
        message: 'Verificación completada exitosamente',
        data: diagnostico
      });

    } catch (error) {
      console.error('❌ Error en verificación:', error);
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