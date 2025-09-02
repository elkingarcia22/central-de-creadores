// =====================================================
// SERVICIO DE API PARA COMENTARIOS DE PARTICIPANTES
// =====================================================

import { supabase } from './supabase';
import { 
  ComentarioParticipante, 
  ComentarioParticipanteForm, 
  EstadisticasComentarios 
} from '../types/comentarios';

export class ComentariosService {
  // Obtener todos los comentarios de un participante
  static async obtenerComentariosParticipante(participanteId: string): Promise<ComentarioParticipante[]> {
    try {
      const { data, error } = await supabase
        .from('vista_comentarios_participantes')
        .select('*')
        .eq('participante_id', participanteId)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error al obtener comentarios:', error);
        throw new Error('Error al obtener comentarios del participante');
      }

      return data || [];
    } catch (error) {
      console.error('Error en obtenerComentariosParticipante:', error);
      throw error;
    }
  }

  // Obtener un comentario específico
  static async obtenerComentario(id: string): Promise<ComentarioParticipante | null> {
    try {
      const { data, error } = await supabase
        .from('vista_comentarios_participantes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error al obtener comentario:', error);
        throw new Error('Error al obtener el comentario');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerComentario:', error);
      throw error;
    }
  }

  // Crear un nuevo comentario
  static async crearComentario(comentario: ComentarioParticipanteForm): Promise<ComentarioParticipante> {
    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const comentarioCompleto = {
        ...comentario,
        usuario_id: user.id,
        activo: true,
        etiquetas: comentario.etiquetas || []
      };

      const { data, error } = await supabase
        .from('comentarios_participantes')
        .insert([comentarioCompleto])
        .select()
        .single();

      if (error) {
        console.error('Error al crear comentario:', error);
        throw new Error('Error al crear el comentario');
      }

      // Obtener el comentario completo con información relacionada
      return await this.obtenerComentario(data.id);
    } catch (error) {
      console.error('Error en crearComentario:', error);
      throw error;
    }
  }

  // Actualizar un comentario
  static async actualizarComentario(id: string, comentario: Partial<ComentarioParticipanteForm>): Promise<ComentarioParticipante> {
    try {
      const { data, error } = await supabase
        .from('comentarios_participantes')
        .update({
          ...comentario,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar comentario:', error);
        throw new Error('Error al actualizar el comentario');
      }

      // Obtener el comentario completo con información relacionada
      return await this.obtenerComentario(data.id);
    } catch (error) {
      console.error('Error en actualizarComentario:', error);
      throw error;
    }
  }

  // Eliminar un comentario (soft delete)
  static async eliminarComentario(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('comentarios_participantes')
        .update({ activo: false })
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar comentario:', error);
        throw new Error('Error al eliminar el comentario');
      }
    } catch (error) {
      console.error('Error en eliminarComentario:', error);
      throw error;
    }
  }

  // Obtener estadísticas de comentarios de un participante
  static async obtenerEstadisticasComentarios(participanteId: string): Promise<EstadisticasComentarios> {
    try {
      const { data, error } = await supabase
        .rpc('obtener_estadisticas_comentarios_participante', {
          p_participante_id: participanteId
        });

      if (error) {
        console.error('Error al obtener estadísticas:', error);
        throw new Error('Error al obtener estadísticas de comentarios');
      }

      return data?.[0] || {
        total_comentarios: 0,
        ultimo_comentario: undefined,
        perfil_estilo_comunicacion: undefined,
        perfil_toma_decisiones: undefined,
        perfil_relacion_proveedores: undefined,
        perfil_cultura_organizacional: undefined,
        perfil_motivacion_principal: undefined
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticasComentarios:', error);
      throw error;
    }
  }

  // Buscar comentarios por texto
  static async buscarComentarios(participanteId: string, termino: string): Promise<ComentarioParticipante[]> {
    try {
      const { data, error } = await supabase
        .from('vista_comentarios_participantes')
        .select('*')
        .eq('participante_id', participanteId)
        .or(`titulo.ilike.%${termino}%,descripcion.ilike.%${termino}%,observaciones_adicionales.ilike.%${termino}%,recomendaciones.ilike.%${termino}%`)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error al buscar comentarios:', error);
        throw new Error('Error al buscar comentarios');
      }

      return data || [];
    } catch (error) {
      console.error('Error en buscarComentarios:', error);
      throw error;
    }
  }

  // Obtener comentarios por categoría
  static async obtenerComentariosPorCategoria(
    participanteId: string, 
    categoria: string, 
    valor: string
  ): Promise<ComentarioParticipante[]> {
    try {
      const { data, error } = await supabase
        .from('vista_comentarios_participantes')
        .select('*')
        .eq('participante_id', participanteId)
        .eq(categoria, valor)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error al obtener comentarios por categoría:', error);
        throw new Error('Error al obtener comentarios por categoría');
      }

      return data || [];
    } catch (error) {
      console.error('Error en obtenerComentariosPorCategoria:', error);
      throw error;
    }
  }

  // Obtener comentarios por etiquetas
  static async obtenerComentariosPorEtiquetas(
    participanteId: string, 
    etiquetas: string[]
  ): Promise<ComentarioParticipante[]> {
    try {
      const { data, error } = await supabase
        .from('vista_comentarios_participantes')
        .select('*')
        .eq('participante_id', participanteId)
        .overlaps('etiquetas', etiquetas)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error al obtener comentarios por etiquetas:', error);
        throw new Error('Error al obtener comentarios por etiquetas');
      }

      return data || [];
    } catch (error) {
      console.error('Error en obtenerComentariosPorEtiquetas:', error);
      throw error;
    }
  }

  // Obtener todas las etiquetas únicas de un participante
  static async obtenerEtiquetasParticipante(participanteId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('comentarios_participantes')
        .select('etiquetas')
        .eq('participante_id', participanteId)
        .eq('activo', true);

      if (error) {
        console.error('Error al obtener etiquetas:', error);
        throw new Error('Error al obtener etiquetas del participante');
      }

      // Combinar todas las etiquetas y eliminar duplicados
      const todasLasEtiquetas = data
        ?.flatMap(comentario => comentario.etiquetas || [])
        .filter((etiqueta, index, array) => array.indexOf(etiqueta) === index)
        .sort() || [];

      return todasLasEtiquetas;
    } catch (error) {
      console.error('Error en obtenerEtiquetasParticipante:', error);
      throw error;
    }
  }

  // Obtener resumen de perfil del participante
  static async obtenerResumenPerfil(participanteId: string): Promise<{
    totalComentarios: number;
    categoriasMasComunes: Record<string, string>;
    ultimaActualizacion?: string;
  }> {
    try {
      const estadisticas = await this.obtenerEstadisticasComentarios(participanteId);
      
      const categoriasMasComunes: Record<string, string> = {};
      
      if (estadisticas.perfil_estilo_comunicacion) {
        categoriasMasComunes.estilo_comunicacion = estadisticas.perfil_estilo_comunicacion.split(', ')[0];
      }
      if (estadisticas.perfil_toma_decisiones) {
        categoriasMasComunes.toma_decisiones = estadisticas.perfil_toma_decisiones.split(', ')[0];
      }
      if (estadisticas.perfil_relacion_proveedores) {
        categoriasMasComunes.relacion_proveedores = estadisticas.perfil_relacion_proveedores.split(', ')[0];
      }
      if (estadisticas.perfil_cultura_organizacional) {
        categoriasMasComunes.cultura_organizacional = estadisticas.perfil_cultura_organizacional.split(', ')[0];
      }
      if (estadisticas.perfil_motivacion_principal) {
        categoriasMasComunes.motivacion_principal = estadisticas.perfil_motivacion_principal.split(', ')[0];
      }

      return {
        totalComentarios: estadisticas.total_comentarios,
        categoriasMasComunes,
        ultimaActualizacion: estadisticas.ultimo_comentario
      };
    } catch (error) {
      console.error('Error en obtenerResumenPerfil:', error);
      throw error;
    }
  }
}
