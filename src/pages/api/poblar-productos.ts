import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔧 Poblando tabla productos con datos de prueba...');

      // Productos de prueba
      const productosPrueba = [
        { nombre: 'Analytics', activo: true },
        { nombre: 'API', activo: true },
        { nombre: 'Dashboard', activo: true },
        { nombre: 'Mobile App', activo: true },
        { nombre: 'Web Platform', activo: true },
        { nombre: 'CRM', activo: true },
        { nombre: 'ERP', activo: true },
        { nombre: 'BI Tools', activo: true },
        { nombre: 'Cloud Services', activo: true },
        { nombre: 'Security Suite', activo: true }
      ];

      // Insertar productos
      const { data, error } = await supabaseServer
        .from('productos')
        .insert(productosPrueba)
        .select();

      if (error) {
        console.error('❌ Error insertando productos:', error);
        return res.status(500).json({ 
          error: 'Error insertando productos', 
          details: error 
        });
      }

      console.log('✅ Productos insertados:', data?.length || 0);

      return res.status(200).json({
        success: true,
        message: 'Productos insertados exitosamente',
        data: {
          productosInsertados: data?.length || 0,
          productos: data || []
        }
      });

    } catch (error) {
      console.error('❌ Error en poblar productos:', error);
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