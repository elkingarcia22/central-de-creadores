import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Obtener participantes usando la estructura real de la tabla
      const { data, error } = await supabase
        .from('participantes')
        .select('*')
        .order('nombre');

      if (error) {
        console.error('Error obteniendo participantes:', error);
        return res.status(500).json({ error: 'Error al obtener participantes' });
      }

      // Obtener roles de empresa por separado
      const { data: rolesData } = await supabase
        .from('roles_empresa')
        .select('id, nombre');

      const rolesMap = new Map(rolesData?.map(rol => [rol.id, rol.nombre]) || []);

      // Obtener empresas por separado
      const { data: empresasData } = await supabase
        .from('empresas')
        .select('id, nombre');

      const empresasMap = new Map(empresasData?.map(empresa => [empresa.id, empresa.nombre]) || []);

      // Obtener productos por separado
      const { data: productosData } = await supabase
        .from('productos')
        .select('id, nombre');

      const productosMap = new Map(productosData?.map(producto => [producto.id, producto.nombre]) || []);

      // Obtener estados de participante
      const { data: estadosData } = await supabase
        .from('estado_participante_cat')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre');

      const estadosMap = new Map(estadosData?.map(estado => [estado.id, estado.nombre]) || []);

      // Obtener productos de empresas por separado
      const { data: empresasProductosData } = await supabase
        .from('empresas')
        .select('id, nombre, producto_id');

      const empresasProductosMap = new Map();
      empresasProductosData?.forEach(empresa => {
        if (empresa.producto_id) {
          const productoEmpresa = productosMap.get(empresa.producto_id);
          empresasProductosMap.set(empresa.id, productoEmpresa ? [productoEmpresa] : []);
        } else {
          empresasProductosMap.set(empresa.id, []);
        }
      });

      // Formatear los datos para el frontend
      const participantesFormateados = data?.map(participante => {
        // Obtener productos de la empresa del participante
        const productosEmpresa = empresasProductosMap.get(participante.empresa_id) || [];

        return {
          id: participante.id,
          nombre: participante.nombre,
          email: participante.email || 'sin-email@ejemplo.com', // Usar email real si existe
          telefono: '', // No existe en la tabla real
          tipo: 'externo', // Agregar tipo explícitamente
          rol_empresa_nombre: rolesMap.get(participante.rol_empresa_id) || 'Sin rol',
          empresa_nombre: empresasMap.get(participante.empresa_id) || 'Sin empresa',
          productos_relacionados: productosEmpresa,
          profesion: participante.descripción || '',
          ubicacion: '', // No existe en la tabla real
          edad: null, // No existe en la tabla real
          genero: '', // No existe en la tabla real
          estado: estadosMap.get(participante.estado_participante) || 'Sin estado',
          sesionesCompletadas: participante.total_participaciones || 0,
          sesionesPendientes: 0, // Valor por defecto
          fechaRegistro: participante.created_at,
          ultimaActividad: participante.fecha_ultima_participacion,
          preferencias: [] // productos_relacionados es uuid, no array
        };
      }) || [];

      res.status(200).json(participantesFormateados);
    } catch (error) {
      console.error('Error en GET /api/participantes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        nombre,
        email,
        rolEmpresaId,
        doleresNecesidades,
        descripcion,
        kamId,
        empresaId,
        productosRelacionados,
        estadoParticipante,
        fechaUltimaParticipacion
      } = req.body;

      // Validar campos requeridos
      if (!nombre || !rolEmpresaId) {
        return res.status(400).json({ 
          error: 'Nombre y rol de empresa son requeridos' 
        });
      }

      // Validar que el KAM existe en la tabla usuarios si se proporciona
      if (kamId) {
        const { data: usuarioExiste, error: errorUsuario } = await supabase
          .from('usuarios')
          .select('id')
          .eq('id', kamId)
          .single();

        if (errorUsuario || !usuarioExiste) {
          console.error('Error validando KAM:', errorUsuario);
          return res.status(400).json({ 
            error: 'El KAM especificado no existe en la tabla usuarios',
            details: errorUsuario?.message 
          });
        }
      }

      // Crear participante usando la estructura real de la tabla
      const { data, error } = await supabase
        .from('participantes')
        .insert({
          nombre: nombre,
          email: email || null, // Asegúrate de que el email sea null si no se proporciona
          rol_empresa_id: rolEmpresaId,
          doleres_necesidades: doleresNecesidades || '',
          descripción: descripcion || '',
          kam_id: kamId || null,
          empresa_id: empresaId || null,
          productos_relacionados: productosRelacionados || null,
          estado_participante: estadoParticipante || null,
          fecha_ultima_participacion: fechaUltimaParticipacion ? new Date(fechaUltimaParticipacion).toISOString() : null,
          total_participaciones: 0,
          creado_por: null // Se puede obtener del usuario autenticado
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando participante:', error);
        return res.status(500).json({ 
          error: 'Error al crear participante',
          details: error.message 
        });
      }

      // Obtener el rol de empresa para la respuesta
      const { data: rolData } = await supabase
        .from('roles_empresa')
        .select('nombre')
        .eq('id', rolEmpresaId)
        .single();

      // Obtener la empresa para la respuesta
      const { data: empresaData } = await supabase
        .from('empresas')
        .select('nombre')
        .eq('id', empresaId)
        .single();

      // Obtener productos de la empresa para la respuesta
      let productosEmpresaNombres = [];
      if (empresaId) {
        const { data: empresaData } = await supabase
          .from('empresas')
          .select('producto_id')
          .eq('id', empresaId)
          .single();

        if (empresaData?.producto_id) {
          const { data: productoData } = await supabase
            .from('productos')
            .select('nombre')
            .eq('id', empresaData.producto_id)
            .single();

          if (productoData?.nombre) {
            productosEmpresaNombres = [productoData.nombre];
          }
        }
      }

      const participanteCreado = {
        id: data.id,
        nombre: data.nombre,
        email: data.email || 'sin-email@ejemplo.com', // Usar email real si existe
        telefono: '', // No existe en la tabla real
        tipo: 'externo', // Agregar tipo explícitamente
        rol_empresa_nombre: rolData?.nombre || 'Sin rol',
        empresa_nombre: empresaData?.nombre || 'Sin empresa',
        productos_relacionados: productosEmpresaNombres,
        profesion: data.descripción || '',
        ubicacion: '', // No existe en la tabla real
        edad: null, // No existe en la tabla real
        genero: '', // No existe en la tabla real
        estado: 'activo',
        sesionesCompletadas: 0,
        sesionesPendientes: 0,
        fechaRegistro: data.created_at,
        ultimaActividad: null,
        preferencias: []
      };

      res.status(201).json(participanteCreado);
    } catch (error) {
      console.error('Error en POST /api/participantes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 