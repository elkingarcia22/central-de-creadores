import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 Test API de dolores iniciado');
    
    const { participanteId, categoriaId, titulo, descripcion, severidad, investigacionId } = req.body;

    console.log('🔍 Datos recibidos:', {
      participanteId,
      categoriaId,
      titulo,
      descripcion,
      severidad,
      investigacionId
    });

    // Verificar que las tablas existen
    console.log('🔍 Verificando existencia de tablas...');
    
    // Verificar tabla categorias_dolores
    const { data: categorias, error: errorCategorias } = await supabaseServer
      .from('categorias_dolores')
      .select('count')
      .limit(1);

    if (errorCategorias) {
      console.error('❌ Error verificando categorias_dolores:', errorCategorias);
      return res.status(500).json({ 
        error: 'Error verificando tabla categorias_dolores',
        details: errorCategorias 
      });
    }

    console.log('✅ Tabla categorias_dolores existe');

    // Verificar tabla dolores_participantes
    const { data: dolores, error: errorDolores } = await supabaseServer
      .from('dolores_participantes')
      .select('count')
      .limit(1);

    if (errorDolores) {
      console.error('❌ Error verificando dolores_participantes:', errorDolores);
      return res.status(500).json({ 
        error: 'Error verificando tabla dolores_participantes',
        details: errorDolores 
      });
    }

    console.log('✅ Tabla dolores_participantes existe');

    // Verificar que el participante existe
    console.log('🔍 Verificando existencia del participante...');
    const { data: participante, error: errorParticipante } = await supabaseServer
      .from('participantes')
      .select('id, nombre')
      .eq('id', participanteId)
      .single();

    if (errorParticipante) {
      console.error('❌ Error verificando participante:', errorParticipante);
      return res.status(404).json({ 
        error: 'Participante no encontrado',
        details: errorParticipante 
      });
    }

    console.log('✅ Participante encontrado:', participante.nombre);

    // Verificar que la categoría existe
    console.log('🔍 Verificando existencia de la categoría...');
    const { data: categoria, error: errorCategoria } = await supabaseServer
      .from('categorias_dolores')
      .select('id, nombre')
      .eq('id', categoriaId)
      .single();

    if (errorCategoria) {
      console.error('❌ Error verificando categoría:', errorCategoria);
      return res.status(404).json({ 
        error: 'Categoría no encontrada',
        details: errorCategoria 
      });
    }

    console.log('✅ Categoría encontrada:', categoria.nombre);

    // Intentar crear el dolor
    console.log('🔍 Intentando crear dolor...');
    const { data: nuevoDolor, error: errorCrear } = await supabaseServer
      .from('dolores_participantes')
      .insert({
        participante_id: participanteId,
        categoria_id: categoriaId,
        titulo,
        descripcion,
        severidad: severidad || 'media',
        investigacion_relacionada_id: investigacionId,
        creado_por: 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d' // Usuario de prueba
      })
      .select()
      .single();

    if (errorCrear) {
      console.error('❌ Error creando dolor:', errorCrear);
      return res.status(500).json({ 
        error: 'Error al crear dolor',
        details: errorCrear 
      });
    }

    console.log('✅ Dolor creado exitosamente:', nuevoDolor.id);

    return res.status(201).json({
      success: true,
      message: 'Dolor creado exitosamente',
      dolor: nuevoDolor
    });

  } catch (error) {
    console.error('❌ Error en test API de dolores:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
