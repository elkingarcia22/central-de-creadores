import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de empresa requerido' });
  }

  try {
    console.log(`🔍 Obteniendo empresa: ${id}`);

    // Obtener información básica de la empresa
    const { data: empresa, error: errorEmpresa } = await supabaseServer
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    console.log('🏢 Empresa obtenida:', empresa);
    console.log('🏢 Campos de empresa:', {
      tamano: empresa?.tamaño,
      relacion: empresa?.relacion,
      industria: empresa?.industria,
      modalidad: empresa?.modalidad
    });

    if (errorEmpresa || !empresa) {
      console.error('❌ Error obteniendo empresa:', errorEmpresa);
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // Obtener datos relacionados por separado
    let kamData = null;
    let paisData = null;
    let estadoData = null;
    let tamanoData = null;
    let relacionData = null;
    let modalidadData = null;
    let industriaData = null;
    let productoData = null;

    if (empresa.kam_id) {
      const { data: kam } = await supabaseServer
        .from('usuarios')
        .select('id, nombre, correo')
        .eq('id', empresa.kam_id)
        .single();
      kamData = kam;
    }

    if (empresa.pais) {
      const { data: pais } = await supabaseServer
        .from('paises')
        .select('id, nombre')
        .eq('id', empresa.pais)
        .single();
      paisData = pais;
    }

    if (empresa.estado) {
      const { data: estado } = await supabaseServer
        .from('estados')
        .select('id, nombre')
        .eq('id', empresa.estado)
        .single();
      estadoData = estado;
    }

    if (empresa['tamaño']) {
      console.log('📏 Buscando tamaño con ID:', empresa['tamaño']);
      const { data: tamano } = await supabaseServer
        .from('tamanos')
        .select('id, nombre')
        .eq('id', empresa['tamaño'])
        .single();
      tamanoData = tamano;
      console.log('📏 Tamaño encontrado:', tamanoData);
    }

    if (empresa.relacion) {
      console.log('🤝 Buscando relación con ID:', empresa.relacion);
      const { data: relacion } = await supabaseServer
        .from('relaciones')
        .select('id, nombre')
        .eq('id', empresa.relacion)
        .single();
      relacionData = relacion;
      console.log('🤝 Relación encontrada:', relacionData);
    }

    if (empresa.modalidad) {
      const { data: modalidad } = await supabaseServer
        .from('modalidades')
        .select('id, nombre')
        .eq('id', empresa.modalidad)
        .single();
      modalidadData = modalidad;
    }

    if (empresa.industria) {
      console.log('🏭 Buscando industria con ID:', empresa.industria);
      const { data: industria } = await supabaseServer
        .from('industrias')
        .select('id, nombre')
        .eq('id', empresa.industria)
        .single();
      industriaData = industria;
      console.log('🏭 Industria encontrada:', industriaData);
    }

    if (empresa.producto_id) {
      const { data: producto } = await supabaseServer
        .from('productos')
        .select('id, nombre')
        .eq('id', empresa.producto_id)
        .single();
      productoData = producto;
    }

    // Obtener productos relacionados desde la tabla de relación
    let productosRelacionados = [];
    if (empresa.id) {
      const { data: productosEmpresa } = await supabaseServer
        .from('empresa_productos')
        .select('producto_id')
        .eq('empresa_id', empresa.id);
      
      if (productosEmpresa && productosEmpresa.length > 0) {
        const productoIds = productosEmpresa.map(p => p.producto_id);
        const { data: productos } = await supabaseServer
          .from('productos')
          .select('id, nombre')
          .in('id', productoIds);
        productosRelacionados = productos || [];
      }
    }

    // Formatear respuesta
    const empresaFormateada = {
      id: empresa.id,
      nombre: empresa.nombre,
      descripcion: empresa.descripcion,
      kam_id: empresa.kam_id,
      kam_nombre: kamData?.nombre,
      kam_email: kamData?.correo,
      pais_id: empresa.pais,
      pais_nombre: paisData?.nombre,
      estado_id: empresa.estado,
      estado_nombre: estadoData?.nombre,
      tamano_id: empresa['tamaño'],
      tamano_nombre: tamanoData?.nombre,
      relacion_id: empresa.relacion,
      relacion_nombre: relacionData?.nombre,
      modalidad_id: empresa.modalidad,
      modalidad_nombre: modalidadData?.nombre,
      industria_id: empresa.industria,
      industria_nombre: industriaData?.nombre,
      producto_id: empresa.producto_id,
      producto_nombre: productoData?.nombre,
      productos_ids: productosRelacionados.map(p => p.id),
      productos_nombres: productosRelacionados.map(p => p.nombre),
      activo: empresa.activo,
      created_at: empresa.created_at,
      updated_at: empresa.updated_at
    };

    console.log(`✅ Empresa obtenida: ${empresaFormateada.nombre}`);
    return res.status(200).json(empresaFormateada);

  } catch (error) {
    console.error('❌ Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
