import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, categoria } = req.query;

      // Construir la consulta base
      let query = supabase
        .from('departamentos')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
        .order('nombre', { ascending: true });

      // Aplicar filtro de búsqueda si se proporciona
      if (search && typeof search === 'string') {
        query = query.ilike('nombre', `%${search}%`);
      }

      // Aplicar filtro de categoría si se proporciona
      if (categoria && typeof categoria === 'string') {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error obteniendo departamentos:', error);
        return res.status(500).json({ error: 'Error al obtener departamentos' });
      }

      // Agrupar por categoría para el frontend
      const departamentosAgrupados = data?.reduce((acc, dept) => {
        const categoria = dept.categoria || 'Otros';
        if (!acc[categoria]) {
          acc[categoria] = [];
        }
        acc[categoria].push(dept);
        return acc;
      }, {} as Record<string, any[]>) || {};

      res.status(200).json({
        departamentos: data || [],
        departamentosAgrupados,
        total: data?.length || 0
      });
    } catch (error) {
      console.error('Error obteniendo departamentos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, descripcion, categoria, orden } = req.body;

      // Validaciones básicas
      if (!nombre) {
        return res.status(400).json({ error: 'Nombre es obligatorio' });
      }

      // Crear departamento en la base de datos
      const { data: newDepartamento, error } = await supabase
        .from('departamentos')
        .insert({
          nombre,
          descripcion,
          categoria,
          orden: orden || 0,
          activo: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando departamento:', error);
        return res.status(500).json({ error: 'Error al crear departamento' });
      }

      res.status(201).json(newDepartamento);
    } catch (error) {
      console.error('Error creando departamento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 