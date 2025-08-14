import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔍 API permisos-roles:', req.method);

    switch (req.method) {
      case 'GET':
        return await getPermisosRoles(req, res);
      case 'POST':
        return await createPermisoRol(req, res);
      case 'PUT':
        return await updatePermisoRol(req, res);
      case 'DELETE':
        return await deletePermisoRol(req, res);
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API permisos-roles:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getPermisosRoles(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { rol_id } = req.query;

    let query = supabase
      .from('permisos_roles')
      .select(`
        *,
        roles_plataforma (
          id,
          nombre,
          descripcion
        ),
        funcionalidades (
          id,
          nombre,
          descripcion,
          modulos (
            id,
            nombre,
            descripcion
          )
        )
      `);

    if (rol_id) {
      query = query.eq('rol_id', rol_id);
    }

    const { data: permisos, error } = await query;

    if (error) {
      console.error('Error obteniendo permisos:', error);
      return res.status(500).json({ error: 'Error obteniendo permisos' });
    }

    console.log('✅ Permisos obtenidos:', permisos?.length);
    return res.status(200).json({ permisos: permisos || [] });
  } catch (error) {
    console.error('Error en getPermisosRoles:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function createPermisoRol(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { rol_id, funcionalidad_id, permitido, permisos } = req.body;

    // Si se envía un array de permisos, crear múltiples
    if (permisos && Array.isArray(permisos)) {
      if (permisos.length === 0) {
        return res.status(201).json({ permisos: [] });
      }

      // Verificar que todos los permisos tengan los campos requeridos
      const invalidPermisos = permisos.filter(p => !p.rol_id || !p.funcionalidad_id);
      if (invalidPermisos.length > 0) {
        return res.status(400).json({ error: 'Todos los permisos deben tener rol_id y funcionalidad_id' });
      }

      const { data: newPermisos, error } = await supabase
        .from('permisos_roles')
        .insert(permisos)
        .select();

      if (error) {
        console.error('❌ Error creando permisos:', error);
        return res.status(500).json({ error: 'Error creando permisos' });
      }

      console.log('✅ Permisos creados:', newPermisos?.length || 0);
      return res.status(201).json({ permisos: newPermisos || [] });
    }

    // Crear un solo permiso
    if (!rol_id || !funcionalidad_id) {
      return res.status(400).json({ error: 'Rol ID y Funcionalidad ID son requeridos' });
    }

    // Verificar que el rol existe
    const { data: rol, error: errorRol } = await supabase
      .from('roles_plataforma')
      .select('id')
      .eq('id', rol_id)
      .single();

    if (errorRol || !rol) {
      return res.status(400).json({ error: 'Rol no encontrado' });
    }

    // Verificar que la funcionalidad existe
    const { data: funcionalidad, error: errorFunc } = await supabase
      .from('funcionalidades')
      .select('id')
      .eq('id', funcionalidad_id)
      .single();

    if (errorFunc || !funcionalidad) {
      return res.status(400).json({ error: 'Funcionalidad no encontrada' });
    }

    const { data: permiso, error } = await supabase
      .from('permisos_roles')
      .insert({
        rol_id,
        funcionalidad_id,
        permitido: permitido !== undefined ? permitido : false
      })
      .select(`
        *,
        roles_plataforma (
          id,
          nombre,
          descripcion
        ),
        funcionalidades (
          id,
          nombre,
          descripcion,
          modulos (
            id,
            nombre,
            descripcion
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error creando permiso:', error);
      return res.status(500).json({ error: 'Error creando permiso' });
    }

    console.log('✅ Permiso creado:', permiso);
    return res.status(201).json({ permiso });
  } catch (error) {
    console.error('Error en createPermisoRol:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function updatePermisoRol(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, permitido } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    const { data: permiso, error } = await supabase
      .from('permisos_roles')
      .update({
        permitido: permitido !== undefined ? permitido : false
      })
      .eq('id', id)
      .select(`
        *,
        roles_plataforma (
          id,
          nombre,
          descripcion
        ),
        funcionalidades (
          id,
          nombre,
          descripcion,
          modulos (
            id,
            nombre,
            descripcion
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error actualizando permiso:', error);
      return res.status(500).json({ error: 'Error actualizando permiso' });
    }

    console.log('✅ Permiso actualizado:', permiso);
    return res.status(200).json({ permiso });
  } catch (error) {
    console.error('Error en updatePermisoRol:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function deletePermisoRol(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    const { error } = await supabase
      .from('permisos_roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando permiso:', error);
      return res.status(500).json({ error: 'Error eliminando permiso' });
    }

    console.log('✅ Permiso eliminado:', id);
    return res.status(200).json({ message: 'Permiso eliminado correctamente' });
  } catch (error) {
    console.error('Error en deletePermisoRol:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
