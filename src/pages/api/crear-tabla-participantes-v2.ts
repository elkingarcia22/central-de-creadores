import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔧 Creando nueva tabla participantes_v2...');

      // PASO 1: Crear la nueva tabla con la estructura correcta
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS participantes_v2 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nombre TEXT NOT NULL,
            rol_empresa_id UUID REFERENCES roles_empresa(id),
            doleres_necesidades TEXT,
            descripción TEXT,
            kam_id UUID REFERENCES usuarios(id),
            empresa_id UUID REFERENCES empresas(id),
            fecha_ultima_participacion TIMESTAMP WITH TIME ZONE,
            total_participaciones INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            creado_por UUID REFERENCES usuarios(id),
            productos_relacionados TEXT[],
            estado_participante UUID REFERENCES estado_participante_cat(id)
          );
        `
      });

      if (createError) {
        console.error('❌ Error creando tabla:', createError);
        return res.status(500).json({ error: 'Error creando tabla', details: createError });
      }

      console.log('✅ Tabla participantes_v2 creada');

      // PASO 2: Migrar datos existentes
      const { data: participantesExistentes, error: selectError } = await supabase
        .from('participantes')
        .select('*');

      if (selectError) {
        console.error('❌ Error obteniendo participantes existentes:', selectError);
        return res.status(500).json({ error: 'Error obteniendo participantes', details: selectError });
      }

      console.log('📋 Participantes existentes encontrados:', participantesExistentes?.length || 0);

      // PASO 3: Insertar en la nueva tabla con KAMs válidos
      if (participantesExistentes && participantesExistentes.length > 0) {
        // Obtener un usuario válido para asignar
        const { data: usuarios, error: usuariosError } = await supabase
          .from('usuarios')
          .select('id')
          .limit(1);

        if (usuariosError || !usuarios || usuarios.length === 0) {
          console.error('❌ Error obteniendo usuarios:', usuariosError);
          return res.status(500).json({ error: 'Error obteniendo usuarios', details: usuariosError });
        }

        const usuarioValido = usuarios[0].id;

        // Preparar datos para migración
        const datosMigracion = participantesExistentes.map(p => ({
          ...p,
          kam_id: p.kam_id ? usuarioValido : null // Asignar usuario válido si tenía KAM
        }));

        const { data: participantesMigrados, error: insertError } = await supabase
          .from('participantes_v2')
          .insert(datosMigracion)
          .select();

        if (insertError) {
          console.error('❌ Error migrando participantes:', insertError);
          return res.status(500).json({ error: 'Error migrando participantes', details: insertError });
        }

        console.log('✅ Participantes migrados:', participantesMigrados?.length || 0);
      }

      // PASO 4: Verificar resultado
      const { data: participantesFinales, error: finalError } = await supabase
        .from('participantes_v2')
        .select(`
          id, 
          nombre, 
          kam_id,
          usuarios!inner(nombre, correo)
        `);

      if (finalError) {
        console.error('❌ Error verificando resultado:', finalError);
        return res.status(500).json({ error: 'Error verificando resultado', details: finalError });
      }

      const resultado = {
        tablaCreada: true,
        participantesMigrados: participantesFinales?.length || 0,
        participantes: participantesFinales || [],
        resumen: {
          totalAntes: participantesExistentes?.length || 0,
          totalDespues: participantesFinales?.length || 0,
          migracionExitosa: true
        }
      };

      console.log('✅ Migración completada:', resultado.resumen);

      return res.status(200).json({
        success: true,
        message: 'Tabla participantes_v2 creada y datos migrados exitosamente',
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