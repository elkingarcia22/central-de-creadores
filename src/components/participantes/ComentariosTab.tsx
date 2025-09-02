// =====================================================
// TAB DE COMENTARIOS PARA PARTICIPANTES
// =====================================================

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';
import Chip from '../ui/Chip';
import { EmptyState } from '../ui/EmptyState';
import { 
  MessageIcon, 
  PlusIcon, 
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  UserIcon
} from '../icons';
import { CrearComentarioModal } from './CrearComentarioModal';
import { ComentariosService } from '../../api/supabase-comentarios';
import { 
  ComentarioParticipante,
  ComentarioParticipanteForm,
  formatearFecha,
  obtenerLabelOpcion,
  obtenerColorCategoria,
  OPCIONES_ESTILO_COMUNICACION,
  OPCIONES_TOMA_DECISIONES,
  OPCIONES_RELACION_PROVEEDORES,
  OPCIONES_CULTURA_ORGANIZACIONAL,
  OPCIONES_NIVEL_APERTURA,
  OPCIONES_EXPECTATIVAS_RESPUESTA,
  OPCIONES_TIPO_FEEDBACK,
  OPCIONES_MOTIVACION_PRINCIPAL
} from '../../types/comentarios';

interface ComentariosTabProps {
  participanteId: string;
  participanteNombre: string;
}

export const ComentariosTab: React.FC<ComentariosTabProps> = ({
  participanteId,
  participanteNombre
}) => {
  const [comentarios, setComentarios] = useState<ComentarioParticipante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingComment, setCreatingComment] = useState(false);

  // Cargar comentarios
  const cargarComentarios = async () => {
    try {
      setLoading(true);
      const data = await ComentariosService.obtenerComentariosParticipante(participanteId);
      setComentarios(data);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarComentarios();
  }, [participanteId]);

  // Crear nuevo comentario
  const handleCrearComentario = async (comentario: ComentarioParticipanteForm) => {
    try {
      setCreatingComment(true);
      await ComentariosService.crearComentario(comentario);
      await cargarComentarios(); // Recargar la lista
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    } finally {
      setCreatingComment(false);
    }
  };

  // Filtrar comentarios por búsqueda
  const comentariosFiltrados = comentarios.filter(comentario =>
    comentario.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comentario.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comentario.observaciones_adicionales?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comentario.recomendaciones?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comentario.etiquetas?.some(etiqueta => 
      etiqueta.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Obtener label de una categoría
  const obtenerLabelCategoria = (categoria: string, valor?: string) => {
    if (!valor) return '';
    
    const opcionesMap: Record<string, Array<{ value: string; label: string }>> = {
      estilo_comunicacion: OPCIONES_ESTILO_COMUNICACION,
      toma_decisiones: OPCIONES_TOMA_DECISIONES,
      relacion_proveedores: OPCIONES_RELACION_PROVEEDORES,
      cultura_organizacional: OPCIONES_CULTURA_ORGANIZACIONAL,
      nivel_apertura: OPCIONES_NIVEL_APERTURA,
      expectativas_respuesta: OPCIONES_EXPECTATIVAS_RESPUESTA,
      tipo_feedback: OPCIONES_TIPO_FEEDBACK,
      motivacion_principal: OPCIONES_MOTIVACION_PRINCIPAL
    };

    const opciones = opcionesMap[categoria];
    if (!opciones) return valor;

    const opcion = opciones.find(opt => opt.value === valor);
    return opcion ? opcion.label : valor;
  };

  // Renderizar categorías del comentario
  const renderCategorias = (comentario: ComentarioParticipante) => {
    const categorias = [
      { key: 'estilo_comunicacion', value: comentario.estilo_comunicacion },
      { key: 'toma_decisiones', value: comentario.toma_decisiones },
      { key: 'relacion_proveedores', value: comentario.relacion_proveedores },
      { key: 'cultura_organizacional', value: comentario.cultura_organizacional },
      { key: 'nivel_apertura', value: comentario.nivel_apertura },
      { key: 'expectativas_respuesta', value: comentario.expectativas_respuesta },
      { key: 'tipo_feedback', value: comentario.tipo_feedback },
      { key: 'motivacion_principal', value: comentario.motivacion_principal }
    ].filter(cat => cat.value);

    if (categorias.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {categorias.map((categoria) => (
          <Chip
            key={categoria.key}
            variant="outline"
            size="sm"
            color={obtenerColorCategoria(categoria.value!)}
          >
            {obtenerLabelCategoria(categoria.key, categoria.value)}
          </Chip>
        ))}
      </div>
    );
  };

  // Renderizar etiquetas
  const renderEtiquetas = (etiquetas?: string[]) => {
    if (!etiquetas || etiquetas.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {etiquetas.map((etiqueta, index) => (
          <Chip
            key={index}
            variant="ghost"
            size="xs"
            color="gray"
          >
            {etiqueta}
          </Chip>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas y botón de crear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageIcon className="w-5 h-5 text-gray-500" />
            <Typography variant="h3" weight="semibold">
              Comentarios de Perfil
            </Typography>
          </div>
          <Chip variant="outline" size="sm">
            {comentarios.length} comentarios
          </Chip>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon={<PlusIcon className="w-4 h-4" />}
        >
          Nuevo Comentario
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Input
          placeholder="Buscar en comentarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
          iconPosition="left"
        />
      </div>

      {/* Lista de comentarios */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : comentariosFiltrados.length === 0 ? (
        <EmptyState
          icon={<MessageIcon className="w-12 h-12 text-gray-400" />}
          title="No hay comentarios"
          description={
            searchTerm 
              ? "No se encontraron comentarios que coincidan con tu búsqueda."
              : "Aún no se han creado comentarios para este participante."
          }
          action={
            !searchTerm && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Crear Primer Comentario
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {comentariosFiltrados.map((comentario) => (
            <Card key={comentario.id} variant="outline" className="p-6">
              {/* Header del comentario */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Typography variant="h4" weight="semibold" className="text-gray-900 dark:text-gray-100">
                    {comentario.titulo}
                  </Typography>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{comentario.usuario_nombre}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatearFecha(comentario.fecha_creacion)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {comentario.descripcion && (
                <div className="mb-4">
                  <Typography variant="body1" className="text-gray-700 dark:text-gray-300">
                    {comentario.descripcion}
                  </Typography>
                </div>
              )}

              {/* Categorías */}
              {renderCategorias(comentario)}

              {/* Observaciones adicionales */}
              {comentario.observaciones_adicionales && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Typography variant="body2" weight="medium" className="text-blue-800 dark:text-blue-200 mb-2">
                    Observaciones:
                  </Typography>
                  <Typography variant="body2" className="text-blue-700 dark:text-blue-300">
                    {comentario.observaciones_adicionales}
                  </Typography>
                </div>
              )}

              {/* Recomendaciones */}
              {comentario.recomendaciones && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Typography variant="body2" weight="medium" className="text-green-800 dark:text-green-200 mb-2">
                    Recomendaciones:
                  </Typography>
                  <Typography variant="body2" className="text-green-700 dark:text-green-300">
                    {comentario.recomendaciones}
                  </Typography>
                </div>
              )}

              {/* Etiquetas */}
              {renderEtiquetas(comentario.etiquetas)}
            </Card>
          ))}
        </div>
      )}

      {/* Modal para crear comentario */}
      <CrearComentarioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        participanteId={participanteId}
        participanteNombre={participanteNombre}
        onSubmit={handleCrearComentario}
        loading={creatingComment}
      />
    </div>
  );
};
