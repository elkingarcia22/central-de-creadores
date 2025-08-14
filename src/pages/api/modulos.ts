import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔍 API módulos:', req.method);

    switch (req.method) {
      case 'GET':
        return await getModulos(req, res);
      case 'POST':
        return await createModulo(req, res);
      case 'PUT':
        return await updateModulo(req, res);
      case 'DELETE':
        return await deleteModulo(req, res);
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API módulos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getModulos(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: modulos, error } = await supabase
      .from('modulos')
      .select('*')
      .eq('activo', true)
      .order('orden');

    if (error) {
      console.error('Error obteniendo módulos:', error);
      return res.status(500).json({ error: 'Error obteniendo módulos' });
    }

    console.log('✅ Módulos obtenidos:', modulos?.length);
    return res.status(200).json({ modulos: modulos || [] });
  } catch (error) {
    console.error('Error en getModulos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function createModulo(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { nombre, descripcion, orden } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre es requerido' });
    }

    const { data: modulo, error } = await supabase
      .from('modulos')
      .insert({
        nombre,
        descripcion: descripcion || '',
        orden: orden || 0,
        activo: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando módulo:', error);
      return res.status(500).json({ error: 'Error creando módulo' });
    }

    console.log('✅ Módulo creado:', modulo);
    return res.status(201).json({ modulo });
  } catch (error) {
    console.error('Error en createModulo:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function updateModulo(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, nombre, descripcion, orden, activo } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    const { data: modulo, error } = await supabase
      .from('modulos')
      .update({
        nombre,
        descripcion,
        orden,
        activo
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando módulo:', error);
      return res.status(500).json({ error: 'Error actualizando módulo' });
    }

    console.log('✅ Módulo actualizado:', modulo);
    return res.status(200).json({ modulo });
  } catch (error) {
    console.error('Error en updateModulo:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function deleteModulo(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID es requerido' });
    }

    // Verificar si hay funcionalidades asociadas
    const { data: funcionalidades, error: errorFunc } = await supabase
      .from('funcionalidades')
      .select('id')
      .eq('modulo_id', id);

    if (errorFunc) {
      console.error('Error verificando funcionalidades:', errorFunc);
      return res.status(500).json({ error: 'Error verificando dependencias' });
    }

    if (funcionalidades && funcionalidades.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el módulo',
        detail: `El módulo tiene ${funcionalidades.length} funcionalidades asociadas. Elimine las funcionalidades primero.`
      });
    }

    const { error } = await supabase
      .from('modulos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando módulo:', error);
      return res.status(500).json({ error: 'Error eliminando módulo' });
    }

    console.log('✅ Módulo eliminado:', id);
    return res.status(200).json({ message: 'Módulo eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteModulo:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
