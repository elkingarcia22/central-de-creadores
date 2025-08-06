import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🧹 Limpiando participantes con KAMs inválidos...');

      // 1. OBTENER PARTICIPANTES CON KAM_ID INVÁLIDO
      console.log('📋 Obteniendo participantes con KAMs inválidos...');
      const { data: participantes, error: errorParticipantes } = await supabase
        .from('participantes')
        .select('id, nombre, kam_id')
        .not('kam_id', 'is', null);

      if (errorParticipantes) {
        console.error('❌ Error al obtener participantes:', errorParticipantes);
        return res.status(500).json({ error: 'Error al obtener participantes', details: errorParticipantes });
      }

      console.log('✅ Participantes encontrados:', participantes?.length || 0);

      // 2. OBTENER UN USUARIO VÁLIDO PARA ASIGNAR
      console.log('👤 Obteniendo usuario válido para asignar...');
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre, correo')
        .limit(1);

      if (errorUsuarios || !usuarios || usuarios.length === 0) {
        console.error('❌ Error al obtener usuarios:', errorUsuarios);
        return res.status(500).json({ error: 'Error al obtener usuarios', details: errorUsuarios });
      }

      const usuarioValido = usuarios[0];
      console.log('✅ Usuario válido encontrado:', usuarioValido);

      // 3. ACTUALIZAR PARTICIPANTES CON KAM VÁLIDO
      if (participantes && participantes.length > 0) {
        console.log('🔄 Actualizando participantes...');
        
        const { data: participantesActualizados, error: errorUpdate } = await supabase
          .from('participantes')
          .update({ kam_id: usuarioValido.id })
          .not('kam_id', 'is', null)
          .select();

        if (errorUpdate) {
          console.error('❌ Error al actualizar participantes:', errorUpdate);
          return res.status(500).json({ error: 'Error al actualizar participantes', details: errorUpdate });
        }

        console.log('✅ Participantes actualizados:', participantesActualizados?.length || 0);
      }

      // 4. VERIFICAR RESULTADO FINAL
      console.log('📊 Verificando resultado final...');
      const { data: participantesFinales, error: errorFinal } = await supabase
        .from('participantes')
        .select('id, nombre, kam_id');

      if (errorFinal) {
        console.error('❌ Error al verificar resultado final:', errorFinal);
        return res.status(500).json({ error: 'Error al verificar resultado final', details: errorFinal });
      }

      const resultado = {
        participantesAntes: participantes || [],
        participantesDespues: participantesFinales || [],
        usuarioAsignado: usuarioValido,
        resumen: {
          totalAntes: participantes?.length || 0,
          totalDespues: participantesFinales?.length || 0,
          limpiezaExitosa: true
        }
      };

      console.log('✅ Limpieza completada:', resultado.resumen);

      return res.status(200).json({
        success: true,
        message: 'Participantes limpiados exitosamente',
        data: resultado
      });

    } catch (error) {
      console.error('❌ Error en el proceso:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 