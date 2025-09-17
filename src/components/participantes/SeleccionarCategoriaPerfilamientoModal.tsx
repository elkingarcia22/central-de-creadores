// =====================================================
// MODAL PARA SELECCIONAR CATEGORÍA DE PERFILAMIENTO
// =====================================================

import React from 'react';
import SideModal from '../ui/SideModal';
import { Button } from '../ui/Button';
import { PageHeader } from '../ui/PageHeader';
import { ContainerTitle } from '../ui/ContainerTitle';
import Typography from '../ui/Typography';
import Chip from '../ui/Chip';
import { 
  MessageIcon, 
  CheckCircleIcon, 
  UserIcon, 
  BuildingIcon, 
  InfoIcon 
} from '../icons';
import { 
  CategoriaPerfilamiento,
  obtenerNombreCategoria,
  obtenerColorCategoria,
  obtenerIconoCategoria
} from '../../types/perfilamientos';

interface NotaParaConvertir {
  id: string;
  contenido: string;
  fecha_creacion: string;
}

interface SeleccionarCategoriaPerfilamientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  participanteId: string;
  participanteNombre: string;
  notasParaConvertir?: NotaParaConvertir[];
  notaPreSeleccionada?: NotaParaConvertir; // Nota que se está convirtiendo
  onCategoriaSeleccionada: (categoria: CategoriaPerfilamiento, notaSeleccionada?: NotaParaConvertir) => void;
}

const CATEGORIAS: Array<{
  id: CategoriaPerfilamiento;
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
}> = [
  {
    id: 'comunicacion',
    nombre: 'Estilo de Comunicación',
    descripcion: 'Cómo se expresa y comunica el participante',
    icono: <MessageIcon className="w-6 h-6" />
  },
  {
    id: 'decisiones',
    nombre: 'Toma de Decisiones',
    descripcion: 'Proceso y estilo de toma de decisiones',
    icono: <CheckCircleIcon className="w-6 h-6" />
  },
  {
    id: 'proveedores',
    nombre: 'Relación con Proveedores',
    descripcion: 'Cómo se relaciona con proveedores y socios',
    icono: <UserIcon className="w-6 h-6" />
  },
  {
    id: 'cultura',
    nombre: 'Cultura Organizacional',
    descripcion: 'Valores y cultura de la organización',
    icono: <BuildingIcon className="w-6 h-6" />
  },
  {
    id: 'comportamiento',
    nombre: 'Comportamiento en la Relación',
    descripcion: 'Patrones de comportamiento en interacciones',
    icono: <UserIcon className="w-6 h-6" />
  },
  {
    id: 'motivaciones',
    nombre: 'Motivaciones y Drivers',
    descripcion: 'Qué motiva y impulsa al participante',
    icono: <InfoIcon className="w-6 h-6" />
  }
];

export const SeleccionarCategoriaPerfilamientoModal: React.FC<SeleccionarCategoriaPerfilamientoModalProps> = ({
  isOpen,
  onClose,
  participanteId,
  participanteNombre,
  notasParaConvertir = [],
  notaPreSeleccionada,
  onCategoriaSeleccionada
}) => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<CategoriaPerfilamiento | null>(null);
  const [notaSeleccionada, setNotaSeleccionada] = React.useState<NotaParaConvertir | null>(null);

  // Debug logs
  React.useEffect(() => {
    console.log('🔄 [MODAL CATEGORIA] Modal abierto con notas:', notasParaConvertir);
    console.log('🔄 [MODAL CATEGORIA] Cantidad de notas:', notasParaConvertir.length);
    console.log('🔄 [MODAL CATEGORIA] Nota pre-seleccionada:', notaPreSeleccionada);
  }, [isOpen, notasParaConvertir, notaPreSeleccionada]);

  // Pre-seleccionar la nota automáticamente
  React.useEffect(() => {
    if (isOpen && notaPreSeleccionada) {
      console.log('🔄 [MODAL CATEGORIA] Pre-seleccionando nota:', notaPreSeleccionada);
      setNotaSeleccionada(notaPreSeleccionada);
    }
  }, [isOpen, notaPreSeleccionada]);
  const handleCategoriaSeleccionada = (categoria: CategoriaPerfilamiento) => {
    setCategoriaSeleccionada(categoria);
  };

  const handleNotaSeleccionada = (nota: NotaParaConvertir) => {
    console.log('🔄 [MODAL CATEGORIA] Nota seleccionada:', nota);
    setNotaSeleccionada(nota);
  };

  const handleContinuar = () => {
    console.log('🔄 [MODAL CATEGORIA] Continuar - Categoría:', categoriaSeleccionada);
    console.log('🔄 [MODAL CATEGORIA] Continuar - Nota:', notaSeleccionada);
    
    // Si hay una nota pre-seleccionada, solo necesitamos la categoría
    const notaFinal = notaSeleccionada || notaPreSeleccionada;
    
    if (categoriaSeleccionada && notaFinal) {
      console.log('🔄 [MODAL CATEGORIA] Llamando onCategoriaSeleccionada con:', categoriaSeleccionada, notaFinal);
      onCategoriaSeleccionada(categoriaSeleccionada, notaFinal);
      onClose();
    } else {
      console.log('🔄 [MODAL CATEGORIA] No se puede continuar - faltan datos');
    }
  };

  const handleCancelar = () => {
    setCategoriaSeleccionada(null);
    setNotaSeleccionada(null);
    onClose();
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Seleccionar Categoría de Perfilamiento"
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
        />

        {/* Información del participante */}
        <div className="bg-muted/50 rounded-lg p-4">
          <ContainerTitle title="Participante" />
          <Typography variant="body1" className="font-medium mt-1">
            {participanteNombre}
          </Typography>
        </div>

        {/* Notas para convertir */}
        {notasParaConvertir.length > 0 && (
          <div className="space-y-3">
            <ContainerTitle title="Selecciona una nota para convertir" />
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Elige la nota que quieres usar como base para el perfilamiento
            </Typography>
            {notaSeleccionada && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <Typography variant="body2" className="text-green-800 dark:text-green-200 font-medium">
                  ✓ Nota seleccionada: {notaSeleccionada.contenido.substring(0, 50)}...
                </Typography>
              </div>
            )}
            <div className="space-y-2">
              {notasParaConvertir.map((nota) => (
                <div
                  key={nota.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    notaSeleccionada?.id === nota.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => handleNotaSeleccionada(nota)}
                >
                  <Typography variant="body2" className="text-gray-700 dark:text-gray-200">
                    {nota.contenido}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(nota.fecha_creacion).toLocaleString()}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className="text-center space-y-3">
          <ContainerTitle title="¿Qué aspecto quieres perfilar?" />
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
            Selecciona la categoría que mejor describa el comportamiento o característica que observaste
          </Typography>
        </div>

        {/* Categorías */}
        <div className="space-y-3">
          {CATEGORIAS.map((categoria) => (
            <div
              key={categoria.id}
              className="border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
              onClick={() => handleCategoriaSeleccionada(categoria.id)}
            >
              <div className="flex items-center gap-4">
                <div className="text-gray-600 group-hover:text-gray-700 transition-colors flex-shrink-0">
                  {categoria.icono}
                </div>
                <div className="flex-1 space-y-1">
                  <Typography variant="h6" weight="semibold" className="text-gray-700 dark:text-gray-200">
                    {categoria.nombre}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    {categoria.descripcion}
                  </Typography>
                </div>
                <div className="flex-shrink-0">
                  <Chip 
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                  >
                    Seleccionar
                  </Chip>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <Typography variant="body2" className="text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Cada perfilamiento se enfoca en un aspecto específico del participante. 
            Esto nos permite construir un perfil completo y detallado a lo largo del tiempo.
          </Typography>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCancelar}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleContinuar}
            disabled={!categoriaSeleccionada || (!notaSeleccionada && !notaPreSeleccionada)}
            className="flex-1"
          >
            Continuar
          </Button>
        </div>
      </div>
    </SideModal>
  );
};
