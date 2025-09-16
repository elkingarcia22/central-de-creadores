import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Crear seguimiento de apoyo
    try {
      const { fecha_seguimiento, notas, responsable_id, estado, participante_externo_id } = req.body;

      console.log('🔧 Creando seguimiento de apoyo...');
      console.log('📝 Datos:', { fecha_seguimiento, notas, responsable_id, estado, participante_externo_id });

      // Para seguimientos de apoyo, usamos una investigación temporal o null
      // Necesitamos crear una entrada en seguimientos_investigacion pero con investigacion_id como null
      // Primero, vamos a verificar si podemos insertar con investigacion_id null
      
      const { data, error } = await supabaseServer
        .from('seguimientos_investigacion')
        .insert([{
          investigacion_id: null, // Intentar con null
          fecha_seguimiento,
          notas,
          responsable_id,
          estado: estado || 'pendiente',
          creado_por: responsable_id,
          participante_externo_id: participante_externo_id || null
        }])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error creando seguimiento de apoyo:', error);
        
        // Si el error es por la restricción NOT NULL, intentamos con una investigación temporal
        if (error.code === '23502' && error.message.includes('investigacion_id')) {
          console.log('🔄 Intentando con investigación temporal...');
          
          // Buscar una investigación temporal o crear una lógica alternativa
          // Por ahora, vamos a usar una investigación existente como placeholder
          const { data: investigaciones, error: errorInv } = await supabaseServer
            .from('investigaciones')
            .select('id')
            .limit(1)
            .single();
            
          if (errorInv) {
            console.error('❌ No se pudo obtener investigación temporal:', errorInv);
            return res.status(500).json({ 
              error: 'No se pudo crear el seguimiento de apoyo', 
              details: 'No hay investigaciones disponibles para asociar el seguimiento'
            });
          }
          
          // Intentar nuevamente con la investigación temporal
          const { data: dataRetry, error: errorRetry } = await supabaseServer
            .from('seguimientos_investigacion')
            .insert([{
              investigacion_id: investigaciones.id,
              fecha_seguimiento,
              notas: `[SEGUIMIENTO DE APOYO] ${notas}`,
              responsable_id,
              estado: estado || 'pendiente',
              creado_por: responsable_id,
              participante_externo_id: participante_externo_id || null
            }])
            .select('*')
            .single();
            
          if (errorRetry) {
            console.error('❌ Error en segundo intento:', errorRetry);
            return res.status(500).json({ 
              error: 'Error creando seguimiento de apoyo', 
              details: errorRetry.message 
            });
          }
          
          console.log('✅ Seguimiento de apoyo creado con investigación temporal:', dataRetry);
          return res.status(200).json({
            success: true,
            message: 'Seguimiento de apoyo creado exitosamente',
            data: dataRetry
          });
        }
        
        return res.status(500).json({ 
          error: 'Error creando seguimiento de apoyo', 
          details: error.message 
        });
      }

      console.log('✅ Seguimiento de apoyo creado exitosamente:', data);

      return res.status(200).json({
        success: true,
        message: 'Seguimiento de apoyo creado exitosamente',
        data
      });

    } catch (error) {
      console.error('❌ Error en seguimientos-apoyo POST:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }

  if (req.method === 'GET') {
    // Obtener seguimientos de apoyo
    try {
      const { participante_externo_id } = req.query;

      let query = supabaseServer
        .from('seguimientos_investigacion')
        .select(`
          *,
          participante_externo:participantes!seguimientos_investigacion_participante_externo_id_fkey(
            id,
            nombre,
            email,
            empresa_nombre
          ),
          responsable:usuarios!seguimientos_investigacion_responsable_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('fecha_seguimiento', { ascending: false });

      // Filtrar por participante externo si se proporciona
      if (participante_externo_id) {
        query = query.eq('participante_externo_id', participante_externo_id);
      }

      // Filtrar solo seguimientos de apoyo (sin investigación o con notas que contengan [SEGUIMIENTO DE APOYO])
      query = query.or('investigacion_id.is.null,notas.like.[SEGUIMIENTO DE APOYO]%');

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error obteniendo seguimientos de apoyo:', error);
        return res.status(500).json({ 
          error: 'Error obteniendo seguimientos de apoyo', 
          details: error.message 
        });
      }

      // Enriquecer los datos con información adicional
      const seguimientosEnriquecidos = (data || []).map(seguimiento => ({
        ...seguimiento,
        investigacion_nombre: 'Sesión de Apoyo' // Siempre mostrar "Sesión de Apoyo" para seguimientos de apoyo
      }));

      console.log('✅ Seguimientos de apoyo obtenidos:', seguimientosEnriquecidos?.length || 0);

      return res.status(200).json({
        success: true,
        data: seguimientosEnriquecidos
      });

    } catch (error) {
      console.error('❌ Error en seguimientos-apoyo GET:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
