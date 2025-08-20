import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (id) {
      // Obtener empresa específica
      // Obtener empresa individual
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .select(`
          *,
          pais_info:paises!empresas_pais_fkey(
            id,
            nombre
          ),
          industria_info:industrias!empresas_industria_fkey(
            id,
            nombre
          ),
          estado_info:estado_empresa!fk_empresas_estado(
            id,
            nombre
          ),
          tamano_info:tamano_empresa!fk_empresas_tamano(
            id,
            nombre
          ),
          modalidad_info:modalidades!fk_empresas_modalidad(
            id,
            nombre
          ),
          relacion_info:relacion_empresa!fk_empresas_relacion(
            id,
            nombre
          ),
          producto_info:productos!empresas_producto_id_fkey(
            id,
            nombre
          )
        `)
        .eq('id', id)
        .single();

      if (empresaError) {
        console.error('Error obteniendo empresa:', empresaError);
        return res.status(500).json({ error: 'Error al obtener empresa' });
      }

      // Obtener información del KAM desde usuarios
      let kamInfo = null;
      if (empresaData.kam_id) {
        const { data: kamData, error: kamError } = await supabase
          .from('usuarios')
          .select('id, nombre, correo')
          .eq('id', empresaData.kam_id)
          .single();
        
        if (!kamError && kamData) {
          kamInfo = kamData;
        }
      }

      const data = { ...empresaData, kam: kamInfo };
      const error = null;

      if (error) {
        console.error('Error obteniendo empresa:', error);
        return res.status(500).json({ error: 'Error al obtener la empresa' });
      }

      return res.status(200).json(data);
    } else {
      // Obtener todas las empresas
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select(`
          *,
          pais_info:paises!empresas_pais_fkey(
            id,
            nombre
          ),
          industria_info:industrias!empresas_industria_fkey(
            id,
            nombre
          ),
          estado_info:estado_empresa!fk_empresas_estado(
            id,
            nombre
          ),
          tamano_info:tamano_empresa!fk_empresas_tamano(
            id,
            nombre
          ),
          modalidad_info:modalidades!fk_empresas_modalidad(
            id,
            nombre
          ),
          relacion_info:relacion_empresa!fk_empresas_relacion(
            id,
            nombre
          ),
          producto_info:productos!empresas_producto_id_fkey(
            id,
            nombre
          )
        `)
        .order('nombre');

      if (empresasError) {
        console.error('Error obteniendo empresas:', empresasError);
        return res.status(500).json({ error: 'Error al obtener empresas' });
      }

      // Obtener información de KAMs desde usuarios
      const kamIds = empresasData?.map(e => e.kam_id).filter(Boolean) || [];
      console.log('🔍 DEBUG: KAM IDs encontrados:', kamIds);
      let kamsInfo = {};
      
      if (kamIds.length > 0) {
        const { data: kamsData, error: kamsError } = await supabase
          .from('usuarios')
          .select('id, nombre, correo')
          .in('id', kamIds);
        
        console.log('🔍 DEBUG: KAMs data:', kamsData);
        console.log('🔍 DEBUG: KAMs error:', kamsError);
        
        if (!kamsError && kamsData) {
          kamsInfo = kamsData.reduce((acc, kam) => {
            acc[kam.id] = kam;
            return acc;
          }, {});
          console.log('🔍 DEBUG: KAMs info object:', kamsInfo);
        }
      }

      const data = empresasData?.map(empresa => {
        const kam = empresa.kam_id ? kamsInfo[empresa.kam_id] : null;
        console.log('🔍 DEBUG: Empresa:', empresa.nombre, 'KAM ID:', empresa.kam_id, 'KAM encontrado:', kam);
        return {
          ...empresa,
          kam: kam
        };
      }) || [];
      const error = null;

      if (error) {
        console.error('Error obteniendo empresas:', error);
        return res.status(500).json({ error: 'Error al obtener empresas' });
      }

      // Transformar datos para incluir nombres de las relaciones
      const empresasTransformadas = data?.map(empresa => ({
        id: empresa.id,
        nombre: empresa.nombre,
        descripcion: empresa.descripcion,
        // Información del KAM
        kam_id: empresa.kam_id,
        kam_nombre: empresa.kam?.nombre || null,
        kam_email: empresa.kam?.correo || null,
        // Información del país
        pais_id: empresa.pais,
        pais_nombre: empresa.pais_info?.nombre || null,
        // Información de la industria
        industria_id: empresa.industria,
        industria_nombre: empresa.industria_info?.nombre || null,
        // Información del estado
        estado_id: empresa.estado,
        estado_nombre: empresa.estado_info?.nombre || null,
        // Información del tamaño
        tamano_id: empresa.tamaño,
        tamano_nombre: empresa.tamano_info?.nombre || null,
        // Información de la modalidad
        modalidad_id: empresa.modalidad,
        modalidad_nombre: empresa.modalidad_info?.nombre || null,
        // Información de la relación
        relacion_id: empresa.relacion,
        relacion_nombre: empresa.relacion_info?.nombre || null,
        // Información del producto
        producto_id: empresa.producto_id,
        producto_nombre: empresa.producto_info?.nombre || null,
        // Campos adicionales para compatibilidad
        sector: empresa.industria_info?.nombre || null, // Usar industria como sector
        tamano: empresa.tamano_info?.nombre || null,
        activo: empresa.estado_info?.nombre === 'Activa' || false,
        created_at: new Date().toISOString(), // Campo temporal
        updated_at: new Date().toISOString() // Campo temporal
      })) || [];

      return res.status(200).json(empresasTransformadas);
    }
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const empresaData = req.body;

    // Validar datos requeridos
    if (!empresaData.nombre) {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido' });
    }

    // Preparar datos para inserción
    const datosEmpresa = {
      nombre: empresaData.nombre,
      descripcion: empresaData.descripcion || null,
      pais: empresaData.pais_id || null,
      industria: empresaData.industria_id || null,
      kam_id: empresaData.kam_id || null,
      producto_id: empresaData.producto_id || null,
      estado: empresaData.estado_id || null,
      relacion: empresaData.relacion_id || null,
      tamaño: empresaData.tamano_id || null,
      modalidad: empresaData.modalidad_id || null
    };

    const { data, error } = await supabase
      .from('empresas')
      .insert([datosEmpresa])
      .select()
      .single();

    if (error) {
      console.error('Error creando empresa:', error);
      return res.status(500).json({ error: 'Error al crear la empresa' });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const empresaData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID de empresa es requerido' });
    }

    // Validar datos requeridos
    if (!empresaData.nombre) {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido' });
    }

    // Preparar datos para actualización
    const datosActualizados = {
      nombre: empresaData.nombre,
      descripcion: empresaData.descripcion || null,
      pais: empresaData.pais_id || null,
      industria: empresaData.industria_id || null,
      kam_id: empresaData.kam_id || null,
      producto_id: empresaData.producto_id || null,
      estado: empresaData.estado_id || null,
      relacion: empresaData.relacion_id || null,
      tamaño: empresaData.tamano_id || null,
      modalidad: empresaData.modalidad_id || null
    };

    const { data, error } = await supabase
      .from('empresas')
      .update(datosActualizados)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando empresa:', error);
      return res.status(500).json({ error: 'Error al actualizar la empresa' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID de empresa es requerido' });
    }

    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando empresa:', error);
      return res.status(500).json({ error: 'Error al eliminar la empresa' });
    }

    return res.status(200).json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 