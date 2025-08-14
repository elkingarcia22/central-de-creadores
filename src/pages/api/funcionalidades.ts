import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔍 API funcionalidades:', req.method);

    switch (req.method) {
      case 'GET':
        return await getFuncionalidades(req, res);
      case 'POST':
        return await createFuncionalidad(req, res);
      case 'PUT':
        return await updateFuncionalidad(req, res);
      case 'DELETE':
        return await deleteFuncionalidad(req, res);
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API funcionalidades:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getFuncionalidades(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { modulo_id } = req.query;

    let query = supabase
      .from('funcionalidades')
      .select(`
        *,
        modulos (
          id,
          nombre,
          descripcion
        )
      `)
      .eq('activo', true)
      .order('orden');

    if (modulo_id) {
      query = query.eq('modulo_id', modulo_id);
    }

    const { data: funcionalidades, error } = await query;

    if (error) {
      console.error('Error obteniendo funcionalidades:', error);
      return res.status(500).json({ error: 'Error obteniendo funcionalidades' });
    }

    console.log('✅ Funcionalidades obtenidas:', funcionalidades?.length);
    return res.status(200).json({ funcionalidades: funcionalidades || [] });
  } catch (error) {
    console.error('Error en getFuncionalidades:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function createFuncionalidad(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { modulo_id, nombre, descripcion, orden } = req.body;

    if (!modulo_id || !nombre) {
      return res.status(400).json({ error: 'Módulo ID y nombre son requeridos' });
    }

    // Verificar que el módulo existe
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('id')
      .eq('id', modulo_id)
      .single();

    if (errorModulo || !modulo) {
      return res.status(400).json({ error: 'Módulo no encontrado' });
    }

    const { data: funcionalidad, error } = await supabase
      .from('funcionalidades')
      .insert({
        modulo_id,
        nombre,
        descripcion: descripcion || '',
        orden: orden || 0,
        activo: true
      })
      .select(`
        *,
        modulos (
          id,
          nombre,
          descripcion
        )
      `)
      .single();

    if (error) {
      console.error('Error creando funcionalidad:', error);
      return res.status(500).json({ error: 'Error creando funcionalidad' });
    }

    console.log('✅ Funcionalidad creada:', funcionalidad);
    return res.status(201).json({ funcionalidad });
  } catch (error) {
    console.error('Error en createFuncionalidad:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function updateFuncionalidad(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, modulo_id, nombre, descripcion, orden, activo } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    const { data: funcionalidad, error } = await supabase
      .from('funcionalidades')
      .update({
        modulo_id,
        nombre,
        descripcion,
        orden,
        activo
      })
      .eq('id', id)
      .select(`
        *,
        modulos (
          id,
          nombre,
          descripcion
        )
      `)
      .single();

    if (error) {
      console.error('Error actualizando funcionalidad:', error);
      return res.status(500).json({ error: 'Error actualizando funcionalidad' });
    }

    console.log('✅ Funcionalidad actualizada:', funcionalidad);
    return res.status(200).json({ funcionalidad });
  } catch (error) {
    console.error('Error en updateFuncionalidad:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function deleteFuncionalidad(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    // Verificar si hay permisos asociados
    const { data: permisos, error: errorPermisos } = await supabase
      .from('permisos_roles')
      .select('id')
      .eq('funcionalidad_id', id);

    if (errorPermisos) {
      console.error('Error verificando permisos:', errorPermisos);
      return res.status(500).json({ error: 'Error verificando dependencias' });
    }

    if (permisos && permisos.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la funcionalidad',
        detail: `La funcionalidad tiene ${permisos.length} permisos asociados. Elimine los permisos primero.`
      });
    }

    const { error } = await supabase
      .from('funcionalidades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando funcionalidad:', error);
      return res.status(500).json({ error: 'Error eliminando funcionalidad' });
    }

    console.log('✅ Funcionalidad eliminada:', id);
    return res.status(200).json({ message: 'Funcionalidad eliminada correctamente' });
  } catch (error) {
    console.error('Error en deleteFuncionalidad:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
