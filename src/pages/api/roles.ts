import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔍 API roles:', req.method);
    switch (req.method) {
      case 'GET': return await getRoles(req, res);
      case 'POST': return await createRol(req, res);
      case 'PUT': return await updateRol(req, res);
      case 'DELETE': return await deleteRol(req, res);
      default: return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('❌ Error en API roles:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getRoles(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: roles, error } = await supabase
      .from('roles_plataforma')
      .select('*')
      .order('nombre');

    if (error) {
      console.error('❌ Error obteniendo roles:', error);
      return res.status(500).json({ error: 'Error obteniendo roles' });
    }

    console.log('✅ Roles obtenidos:', roles?.length || 0);
    return res.status(200).json({ roles: roles || [] });
  } catch (error) {
    console.error('❌ Error en getRoles:', error);
    return res.status(500).json({ error: 'Error obteniendo roles' });
  }
}

async function createRol(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { nombre, descripcion, activo = true, es_sistema = false } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del rol es requerido' });
    }

    // Verificar si el rol ya existe
    const { data: existingRol, error: checkError } = await supabase
      .from('roles_plataforma')
      .select('id')
      .eq('nombre', nombre)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error verificando rol existente:', checkError);
      return res.status(500).json({ error: 'Error verificando rol existente' });
    }

    if (existingRol) {
      return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
    }

    const { data: newRol, error } = await supabase
      .from('roles_plataforma')
      .insert({
        nombre,
        descripcion,
        activo,
        es_sistema
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando rol:', error);
      return res.status(500).json({ error: 'Error creando rol' });
    }

    console.log('✅ Rol creado:', newRol);
    return res.status(201).json({ rol: newRol });
  } catch (error) {
    console.error('❌ Error en createRol:', error);
    return res.status(500).json({ error: 'Error creando rol' });
  }
}

async function updateRol(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, nombre, descripcion, activo, es_sistema } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'El ID del rol es requerido' });
    }

    // Verificar si el rol existe
    const { data: existingRol, error: checkError } = await supabase
      .from('roles_plataforma')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('❌ Error verificando rol:', checkError);
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
    if (nombre && nombre !== existingRol.nombre) {
      const { data: duplicateRol, error: duplicateError } = await supabase
        .from('roles_plataforma')
        .select('id')
        .eq('nombre', nombre)
        .neq('id', id)
        .single();

      if (duplicateError && duplicateError.code !== 'PGRST116') {
        console.error('❌ Error verificando rol duplicado:', duplicateError);
        return res.status(500).json({ error: 'Error verificando rol duplicado' });
      }

      if (duplicateRol) {
        return res.status(400).json({ error: 'Ya existe otro rol con ese nombre' });
      }
    }

    const updateData: any = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (activo !== undefined) updateData.activo = activo;
    if (es_sistema !== undefined) updateData.es_sistema = es_sistema;

    const { data: updatedRol, error } = await supabase
      .from('roles_plataforma')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando rol:', error);
      return res.status(500).json({ error: 'Error actualizando rol' });
    }

    console.log('✅ Rol actualizado:', updatedRol);
    return res.status(200).json({ rol: updatedRol });
  } catch (error) {
    console.error('❌ Error en updateRol:', error);
    return res.status(500).json({ error: 'Error actualizando rol' });
  }
}

async function deleteRol(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'El ID del rol es requerido' });
    }

    // Verificar si el rol existe y es un rol del sistema
    const { data: existingRol, error: checkError } = await supabase
      .from('roles_plataforma')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('❌ Error verificando rol:', checkError);
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    if (existingRol.es_sistema) {
      return res.status(400).json({ error: 'No se puede eliminar un rol del sistema' });
    }

    // Verificar si hay usuarios asignados a este rol
    const { data: usersWithRole, error: usersError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', id);

    if (usersError) {
      console.error('❌ Error verificando usuarios con rol:', usersError);
      return res.status(500).json({ error: 'Error verificando usuarios con rol' });
    }

    if (usersWithRole && usersWithRole.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el rol',
        detail: `Hay ${usersWithRole.length} usuario(s) asignado(s) a este rol. Primero debe reasignar estos usuarios.`
      });
    }

    // Eliminar permisos asociados al rol
    const { error: permisosError } = await supabase
      .from('permisos_roles')
      .delete()
      .eq('rol_id', id);

    if (permisosError) {
      console.error('❌ Error eliminando permisos del rol:', permisosError);
      return res.status(500).json({ error: 'Error eliminando permisos del rol' });
    }

    // Eliminar el rol
    const { error } = await supabase
      .from('roles_plataforma')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error eliminando rol:', error);
      return res.status(500).json({ error: 'Error eliminando rol' });
    }

    console.log('✅ Rol eliminado:', id);
    return res.status(200).json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error en deleteRol:', error);
    return res.status(500).json({ error: 'Error eliminando rol' });
  }
}
