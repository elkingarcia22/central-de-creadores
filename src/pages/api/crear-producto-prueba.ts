import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔧 Creando producto de prueba...');

      // 1. PRODUCTO DE PRUEBA SIMPLE
      const productoPrueba = {
        nombre: 'Producto de Prueba'
      };

      // 2. INSERTAR PRODUCTO
      console.log('📦 Insertando producto de prueba...');
      const { data: productoInsertado, error: errorInsert } = await supabase
        .from('productos')
        .insert(productoPrueba)
        .select()
        .single();

      if (errorInsert) {
        console.error('❌ Error al insertar producto:', errorInsert);
        return res.status(500).json({ error: 'Error al insertar producto', details: errorInsert });
      }

      console.log('✅ Producto insertado:', productoInsertado);

      // 3. OBTENER ESTRUCTURA
      const estructura = Object.keys(productoInsertado);
      
      const resultado = {
        productoInsertado: productoInsertado,
        estructura: estructura,
        resumen: {
          columnas: estructura,
          totalColumnas: estructura.length
        }
      };

      console.log('✅ Estructura obtenida:', resultado.resumen);

      return res.status(200).json({
        success: true,
        message: 'Producto de prueba creado exitosamente',
        data: resultado
      });

    } catch (error) {
      console.error('❌ Error en el proceso:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 