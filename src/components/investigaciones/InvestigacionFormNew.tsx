import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useToast } from '../../contexts/ToastContext';
import { 
  InvestigacionFormData, 
  Investigacion, 
  Periodo,
  Producto,
  TipoInvestigacion,
  Usuario,
  OPCIONES_ESTADO_INVESTIGACION,
  OPCIONES_TIPO_PRUEBA,
  OPCIONES_PLATAFORMA,
  OPCIONES_TIPO_SESION,
  validarInvestigacion
} from '../../types/supabase-investigaciones';

interface InvestigacionFormProps {
  investigacion?: Investigacion;
  periodos: Periodo[];
  productos: Producto[];
  tiposInvestigacion: TipoInvestigacion[];
  usuarios: Usuario[];
  onSubmit: (data: InvestigacionFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function InvestigacionFormNew({
  investigacion,
  periodos,
  productos,
  tiposInvestigacion,
  usuarios,
  onSubmit,
  onCancel,
  loading = false
}: InvestigacionFormProps) {
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<InvestigacionFormData>({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    producto_id: '',
    tipo_investigacion_id: '',
    periodo_id: '',
    responsable_id: '',
    implementador_id: '',
    estado: 'en_borrador',
    tipo_prueba: undefined,
    plataforma: undefined,
    tipo_sesion: undefined,
    libreto: '',
    link_prueba: '',
    link_resultados: '',
    notas_seguimiento: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos si estamos editando
  useEffect(() => {
    if (investigacion) {
      setFormData({
        nombre: investigacion.nombre,
        fecha_inicio: investigacion.fecha_inicio,
        fecha_fin: investigacion.fecha_fin,
        producto_id: investigacion.producto_id,
        tipo_investigacion_id: investigacion.tipo_investigacion_id,
        periodo_id: investigacion.periodo_id || '',
        responsable_id: investigacion.responsable_id || '',
        implementador_id: investigacion.implementador_id || '',
        estado: investigacion.estado || 'en_borrador',
        tipo_prueba: investigacion.tipo_prueba || undefined,
        plataforma: investigacion.plataforma || undefined,
        tipo_sesion: investigacion.tipo_sesion || undefined,
        libreto: investigacion.libreto || '',
        link_prueba: investigacion.link_prueba || '',
        link_resultados: investigacion.link_resultados || '',
        notas_seguimiento: investigacion.notas_seguimiento || ''
      });
    }
  }, [investigacion]);

  const handleChange = (field: keyof InvestigacionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    const erroresValidacion = validarInvestigacion(formData);
    if (erroresValidacion.length > 0) {
      const errorsObj: Record<string, string> = {};
      erroresValidacion.forEach(error => {
        if (error.includes('nombre')) errorsObj.nombre = error;
        if (error.includes('fecha de inicio')) errorsObj.fecha_inicio = error;
        if (error.includes('fecha de fin')) errorsObj.fecha_fin = error;
        if (error.includes('producto')) errorsObj.producto_id = error;
        if (error.includes('tipo de investigación')) errorsObj.tipo_investigacion_id = error;
      });
      setErrors(errorsObj);
      
      showError(
        'Formulario incompleto',
        'Por favor completa todos los campos requeridos'
      );
      return;
    }

    try {
      await onSubmit(formData);
      
      // Mostrar toast de éxito
      showSuccess(
        investigacion ? 'Investigación actualizada' : 'Investigación creada',
        investigacion 
          ? `La investigación "${formData.nombre}" ha sido actualizada correctamente`
          : `La investigación "${formData.nombre}" ha sido creada exitosamente`
      );
      
      // Esperar un poco para que el usuario vea el toast antes de que el componente padre cierre el modal
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      
      // Mostrar toast de error
      showError(
        investigacion ? 'Error al actualizar investigación' : 'Error al crear investigación',
        error instanceof Error ? error.message : 'Ha ocurrido un error inesperado'
      );
    }
  };

  // Opciones para los selects
  const opcionesPeriodos = [
    { value: '', label: 'Sin período asignado' },
    ...periodos.map(periodo => ({
      value: periodo.id,
      label: periodo.nombre
    }))
  ];

  const opcionesProductos = productos.map(producto => ({
    value: producto.id,
    label: producto.nombre
  }));

  const opcionesTiposInvestigacion = tiposInvestigacion.map(tipo => ({
    value: tipo.id,
    label: tipo.nombre
  }));

  const opcionesUsuarios = [
    { value: '', label: 'Sin asignar' },
    ...usuarios.map(usuario => ({
      value: usuario.id,
      label: usuario.full_name || usuario.email || 'Usuario sin nombre'
    }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          Información básica
        </h3>
        
        <Input
          label="Nombre de la investigación"
          value={formData.nombre}
          onChange={(value) => handleChange('nombre', value)}
          error={errors.nombre}
          placeholder="Ej: Estudio de usabilidad del checkout"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de inicio *
            </label>
            <input
              type="date"
              value={formData.fecha_inicio}
              onChange={(e) => handleChange('fecha_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            {errors.fecha_inicio && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de fin *
            </label>
            <input
              type="date"
              value={formData.fecha_fin}
              onChange={(e) => handleChange('fecha_fin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            {errors.fecha_fin && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_fin}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Producto"
            value={formData.producto_id}
            onChange={(value) => handleChange('producto_id', value)}
            options={opcionesProductos}
            error={errors.producto_id}
            required
          />

          <Select
            label="Tipo de investigación"
            value={formData.tipo_investigacion_id}
            onChange={(value) => handleChange('tipo_investigacion_id', value)}
            options={opcionesTiposInvestigacion}
            error={errors.tipo_investigacion_id}
            required
          />
        </div>
      </div>

      {/* Asignaciones */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          Asignaciones
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Período"
            value={formData.periodo_id}
            onChange={(value) => handleChange('periodo_id', value)}
            options={opcionesPeriodos}
          />

          <Select
            label="Responsable"
            value={formData.responsable_id}
            onChange={(value) => handleChange('responsable_id', value)}
            options={opcionesUsuarios}
          />

          <Select
            label="Implementador"
            value={formData.implementador_id}
            onChange={(value) => handleChange('implementador_id', value)}
            options={opcionesUsuarios}
          />
        </div>
      </div>

      {/* Configuración */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          Configuración
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Estado"
            value={formData.estado}
            onChange={(value) => handleChange('estado', value)}
            options={OPCIONES_ESTADO_INVESTIGACION}
          />

          <Select
            label="Tipo de prueba"
            value={formData.tipo_prueba || ''}
            onChange={(value) => handleChange('tipo_prueba', value || undefined)}
            options={[
              { value: '', label: 'Sin especificar' },
              ...OPCIONES_TIPO_PRUEBA
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Plataforma"
            value={formData.plataforma || ''}
            onChange={(value) => handleChange('plataforma', value || undefined)}
            options={[
              { value: '', label: 'Sin especificar' },
              ...OPCIONES_PLATAFORMA
            ]}
          />

          <Select
            label="Tipo de sesión"
            value={formData.tipo_sesion || ''}
            onChange={(value) => handleChange('tipo_sesion', value || undefined)}
            options={[
              { value: '', label: 'Sin especificar' },
              ...OPCIONES_TIPO_SESION
            ]}
          />
        </div>
      </div>

      {/* Enlaces y contenido */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          Enlaces y contenido
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="url"
            label="Link de prueba"
            value={formData.link_prueba}
            onChange={(value) => handleChange('link_prueba', value)}
            placeholder="https://..."
          />

          <Input
            type="url"
            label="Link de resultados"
            value={formData.link_resultados}
            onChange={(value) => handleChange('link_resultados', value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Libreto
          </label>
          <textarea
            value={formData.libreto}
            onChange={(e) => handleChange('libreto', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Describe el libreto o guión de la investigación..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notas de seguimiento
          </label>
          <textarea
            value={formData.notas_seguimiento}
            onChange={(e) => handleChange('notas_seguimiento', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Notas adicionales sobre el seguimiento..."
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {investigacion ? 'Actualizar investigación' : 'Crear investigación'}
        </Button>
      </div>
    </form>
  );
} 