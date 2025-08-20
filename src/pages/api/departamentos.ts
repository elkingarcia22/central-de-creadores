import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .order('nombre');

    if (error) {
      console.error('Error obteniendo departamentos:', error);
      // Si la tabla no existe, devolver datos por defecto
      const departamentosPorDefecto = [
        { id: '1', nombre: 'Desarrollo', categoria: 'Tecnología', descripcion: 'Equipo de desarrollo', orden: 1 },
        { id: '2', nombre: 'Diseño', categoria: 'Tecnología', descripcion: 'Equipo de diseño', orden: 2 },
        { id: '3', nombre: 'Producto', categoria: 'Negocio', descripcion: 'Equipo de producto', orden: 3 },
        { id: '4', nombre: 'Marketing', categoria: 'Negocio', descripcion: 'Equipo de marketing', orden: 4 },
        { id: '5', nombre: 'Ventas', categoria: 'Negocio', descripcion: 'Equipo de ventas', orden: 5 }
      ];

      const departamentosAgrupados = departamentosPorDefecto.reduce((acc: any, dept: any) => {
        const categoria = dept.categoria || 'Sin categoría';
        if (!acc[categoria]) {
          acc[categoria] = [];
        }
        acc[categoria].push(dept);
        return acc;
      }, {});

      return res.status(200).json({
        departamentos: departamentosPorDefecto,
        departamentosAgrupados: departamentosAgrupados
      });
    }

    // Agrupar departamentos por categoría
    const departamentosAgrupados = (data || []).reduce((acc: any, dept: any) => {
      const categoria = dept.categoria || 'Sin categoría';
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(dept);
      return acc;
    }, {});

    return res.status(200).json({
      departamentos: data || [],
      departamentosAgrupados: departamentosAgrupados
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 