import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { empresaId, productoId } = req.body;

      if (!empresaId || !productoId) {
        return res.status(400).json({ 
          error: 'empresaId y productoId son requeridos' 
        });
      }

      console.log('🔧 Asignando producto a empresa...');
      console.log('🏢 Empresa ID:', empresaId);
      console.log('📦 Producto ID:', productoId);

      // Actualizar la empresa con el producto
      const { data, error } = await supabase
        .from('empresas')
        .update({ producto_id: productoId })
        .eq('id', empresaId)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando empresa:', error);
        return res.status(500).json({ 
          error: 'Error al actualizar empresa',
          details: error.message 
        });
      }

      console.log('✅ Empresa actualizada:', data);

      res.status(200).json({
        success: true,
        empresa: data,
        message: 'Producto asignado correctamente a la empresa'
      });
    } catch (error) {
      console.error('Error en POST /api/asignar-producto-empresa:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 