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
          .select('id, nombre, correo, foto_url')
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
          .select('id, nombre, correo, foto_url')
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

      // Obtener productos múltiples para todas las empresas
      const empresaIds = data?.map(e => e.id) || [];
      let productosPorEmpresa = {};
      
      if (empresaIds.length > 0) {
        const { data: productosData, error: productosError } = await supabase
          .from('empresa_productos')
          .select(`
            empresa_id,
            producto_id,
            productos!empresa_productos_producto_id_fkey(
              id,
              nombre
            )
          `)
          .in('empresa_id', empresaIds);

        if (!productosError && productosData) {
          productosPorEmpresa = productosData.reduce((acc, p) => {
            if (!acc[p.empresa_id]) {
              acc[p.empresa_id] = [];
            }
            acc[p.empresa_id].push({
              id: p.producto_id,
              nombre: p.productos?.nombre
            });
            return acc;
          }, {});
        }
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
        kam_foto_url: empresa.kam?.foto_url || null,
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
        // Productos múltiples
        productos_ids: productosPorEmpresa[empresa.id]?.map(p => p.id) || [],
        productos_nombres: productosPorEmpresa[empresa.id]?.map(p => p.nombre) || [],
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
      producto_id: empresaData.producto_id || null, // Mantener para compatibilidad
      estado: empresaData.estado_id || null,
      relacion: empresaData.relacion_id || null,
      tamaño: empresaData.tamano_id || null,
      modalidad: empresaData.modalidad_id || null
    };

    const { data, error } = await supabase
      .from('empresas')
      .insert([datosEmpresa])
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
      .single();

    if (error) {
      console.error('Error creando empresa:', error);
      return res.status(500).json({ error: 'Error al crear la empresa' });
    }

    // Manejar múltiples productos si se proporcionan
    if (empresaData.productos_ids && Array.isArray(empresaData.productos_ids) && empresaData.productos_ids.length > 0) {
      const productosData = empresaData.productos_ids.map(productoId => ({
        empresa_id: data.id,
        producto_id: productoId
      }));

      const { error: productosError } = await supabase
        .from('empresa_productos')
        .insert(productosData);

      if (productosError) {
        console.error('Error insertando productos de empresa:', productosError);
        // No fallar la creación de la empresa si falla la inserción de productos
      }
    }

    // Obtener información del KAM desde usuarios
    let kamInfo = null;
    if (data.kam_id) {
      const { data: kamData, error: kamError } = await supabase
        .from('usuarios')
        .select('id, nombre, correo, foto_url')
        .eq('id', data.kam_id)
        .single();
      
      if (!kamError && kamData) {
        kamInfo = kamData;
      }
    }

    // Obtener productos asociados
    let productosInfo = [];
    if (data.id) {
      const { data: productosData, error: productosError } = await supabase
        .from('empresa_productos')
        .select(`
          producto_id,
          productos!empresa_productos_producto_id_fkey(
            id,
            nombre
          )
        `)
        .eq('empresa_id', data.id);

      if (!productosError && productosData) {
        productosInfo = productosData.map(p => ({
          id: p.producto_id,
          nombre: p.productos?.nombre
        }));
      }
    }

    // Transformar datos para mantener consistencia con handleGet
    const empresaTransformada = {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      kam_id: data.kam_id,
      kam_nombre: kamInfo?.nombre || null,
      kam_email: kamInfo?.correo || null,
      kam_foto_url: kamInfo?.foto_url || null,
      pais_id: data.pais,
      pais_nombre: data.pais_info?.nombre || null,
      industria_id: data.industria,
      industria_nombre: data.industria_info?.nombre || null,
      estado_id: data.estado,
      estado_nombre: data.estado_info?.nombre || null,
      tamano_id: data.tamaño,
      tamano_nombre: data.tamano_info?.nombre || null,
      modalidad_id: data.modalidad,
      modalidad_nombre: data.modalidad_info?.nombre || null,
      relacion_id: data.relacion,
      relacion_nombre: data.relacion_info?.nombre || null,
      producto_id: data.producto_id,
      producto_nombre: data.producto_info?.nombre || null,
      productos_ids: productosInfo.map(p => p.id),
      productos_nombres: productosInfo.map(p => p.nombre),
      sector: data.industria_info?.nombre || null,
      tamano: data.tamano_info?.nombre || null,
      activo: data.estado_info?.nombre === 'Activa' || false,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return res.status(201).json(empresaTransformada);
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

    // Obtener empresa actual para validación y datos existentes
    const { data: empresaActual, error: errorEmpresa } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (errorEmpresa) {
      console.error('Error obteniendo empresa actual:', errorEmpresa);
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // Preparar datos para actualización (permitir ediciones parciales)
    const datosActualizados = {
      nombre: empresaData.nombre !== undefined ? empresaData.nombre : empresaActual.nombre,
      descripcion: empresaData.descripcion !== undefined ? empresaData.descripcion : empresaActual.descripcion,
      pais: empresaData.pais_id !== undefined ? empresaData.pais_id : empresaActual.pais,
      industria: empresaData.industria_id !== undefined ? empresaData.industria_id : empresaActual.industria,
      kam_id: empresaData.kam_id !== undefined ? empresaData.kam_id : empresaActual.kam_id,
      producto_id: empresaData.producto_id !== undefined ? empresaData.producto_id : empresaActual.producto_id,
      estado: empresaData.estado_id !== undefined ? empresaData.estado_id : empresaActual.estado,
      relacion: empresaData.relacion_id !== undefined ? empresaData.relacion_id : empresaActual.relacion,
      tamaño: empresaData.tamano_id !== undefined ? empresaData.tamano_id : empresaActual.tamaño,
      modalidad: empresaData.modalidad_id !== undefined ? empresaData.modalidad_id : empresaActual.modalidad
    };

    const { data, error } = await supabase
      .from('empresas')
      .update(datosActualizados)
      .eq('id', id)
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
      .single();

    if (error) {
      console.error('Error actualizando empresa:', error);
      return res.status(500).json({ error: 'Error al actualizar la empresa' });
    }

    // Obtener información del KAM desde usuarios
    let kamInfo = null;
    if (data.kam_id) {
      const { data: kamData, error: kamError } = await supabase
        .from('usuarios')
        .select('id, nombre, correo, foto_url')
        .eq('id', data.kam_id)
        .single();
      
      if (!kamError && kamData) {
        kamInfo = kamData;
      }
    }

    // Transformar datos para mantener consistencia con handleGet
    const empresaTransformada = {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      kam_id: data.kam_id,
      kam_nombre: kamInfo?.nombre || null,
      kam_email: kamInfo?.correo || null,
      kam_foto_url: kamInfo?.foto_url || null,
      pais_id: data.pais,
      pais_nombre: data.pais_info?.nombre || null,
      industria_id: data.industria,
      industria_nombre: data.industria_info?.nombre || null,
      estado_id: data.estado,
      estado_nombre: data.estado_info?.nombre || null,
      tamano_id: data.tamaño,
      tamano_nombre: data.tamano_info?.nombre || null,
      modalidad_id: data.modalidad,
      modalidad_nombre: data.modalidad_info?.nombre || null,
      relacion_id: data.relacion,
      relacion_nombre: data.relacion_info?.nombre || null,
      producto_id: data.producto_id,
      producto_nombre: data.producto_info?.nombre || null,
      sector: data.industria_info?.nombre || null,
      tamano: data.tamano_info?.nombre || null,
      activo: data.estado_info?.nombre === 'Activa' || false,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return res.status(200).json(empresaTransformada);
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

    // Verificar dependencias antes de eliminar
    console.log(`🔍 Verificando dependencias para empresa ${id}...`);

    // 1. Verificar si hay participantes externos usando esta empresa
    const { data: participantes, error: participantesError } = await supabase
      .from('participantes')
      .select('id, nombre, email')
      .eq('empresa_id', id);

    if (participantesError) {
      console.error('Error verificando participantes:', participantesError);
      return res.status(500).json({ error: 'Error al verificar dependencias' });
    }

    if (participantes && participantes.length > 0) {
      console.log(`❌ Empresa tiene ${participantes.length} participantes externos asociados`);
      return res.status(409).json({ 
        error: 'No se puede eliminar la empresa',
        details: {
          type: 'participantes_externos',
          count: participantes.length,
          message: `Esta empresa tiene ${participantes.length} participante(s) externo(s) asociado(s). Debes eliminar o reasignar estos participantes antes de eliminar la empresa.`,
          participantes: participantes.map(p => ({ id: p.id, nombre: p.nombre, email: p.email }))
        }
      });
    }

    // 2. Verificar si hay reclutamientos que usan esta empresa (a través de participantes)
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        participantes_id,
        participantes:participantes!reclutamientos_participantes_id_fkey(
          id,
          nombre,
          email,
          empresa_id
        )
      `)
      .not('participantes_id', 'is', null);

    if (reclutamientosError) {
      console.error('Error verificando reclutamientos:', reclutamientosError);
      return res.status(500).json({ error: 'Error al verificar dependencias' });
    }

    // Filtrar reclutamientos que usan participantes de esta empresa
    const reclutamientosConEmpresa = reclutamientos?.filter(r => 
      r.participantes && r.participantes.empresa_id === id
    ) || [];

    if (reclutamientosConEmpresa.length > 0) {
      console.log(`❌ Empresa tiene ${reclutamientosConEmpresa.length} reclutamiento(s) asociado(s)`);
      return res.status(409).json({ 
        error: 'No se puede eliminar la empresa',
        details: {
          type: 'reclutamientos',
          count: reclutamientosConEmpresa.length,
          message: `Esta empresa tiene ${reclutamientosConEmpresa.length} reclutamiento(s) asociado(s). Debes eliminar estos reclutamientos antes de eliminar la empresa.`,
          reclutamientos: reclutamientosConEmpresa.map(r => ({ 
            id: r.id, 
            participante: r.participantes ? { 
              id: r.participantes.id, 
              nombre: r.participantes.nombre, 
              email: r.participantes.email 
            } : null 
          }))
        }
      });
    }

    console.log(`✅ No se encontraron dependencias, procediendo a eliminar empresa ${id}`);

    // Si no hay dependencias, proceder con la eliminación
    const { error: deleteError } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error eliminando empresa:', deleteError);
      return res.status(500).json({ error: 'Error al eliminar la empresa' });
    }

    console.log(`✅ Empresa ${id} eliminada correctamente`);
    return res.status(200).json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 