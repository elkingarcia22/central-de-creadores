import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../api/supabase';

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
    const { data: empresa, error: errorEmpresa } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

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
      const { data: kam } = await supabase
        .from('usuarios')
        .select('id, nombre, correo')
        .eq('id', empresa.kam_id)
        .single();
      kamData = kam;
    }

    if (empresa.pais) {
      const { data: pais } = await supabase
        .from('paises')
        .select('id, nombre')
        .eq('id', empresa.pais)
        .single();
      paisData = pais;
    }

    if (empresa.estado) {
      const { data: estado } = await supabase
        .from('estados')
        .select('id, nombre')
        .eq('id', empresa.estado)
        .single();
      estadoData = estado;
    }

    if (empresa['tamaño']) {
      const { data: tamano } = await supabase
        .from('tamanos')
        .select('id, nombre')
        .eq('id', empresa['tamaño'])
        .single();
      tamanoData = tamano;
    }

    if (empresa.relacion) {
      const { data: relacion } = await supabase
        .from('relaciones')
        .select('id, nombre')
        .eq('id', empresa.relacion)
        .single();
      relacionData = relacion;
    }

    if (empresa.modalidad) {
      const { data: modalidad } = await supabase
        .from('modalidades')
        .select('id, nombre')
        .eq('id', empresa.modalidad)
        .single();
      modalidadData = modalidad;
    }

    if (empresa.industria) {
      const { data: industria } = await supabase
        .from('industrias')
        .select('id, nombre')
        .eq('id', empresa.industria)
        .single();
      industriaData = industria;
    }

    if (empresa.producto_id) {
      const { data: producto } = await supabase
        .from('productos')
        .select('id, nombre')
        .eq('id', empresa.producto_id)
        .single();
      productoData = producto;
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
