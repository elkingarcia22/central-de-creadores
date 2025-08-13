import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '../../components/ui';
import { InvestigacionFormNew } from '../../components/investigaciones/InvestigacionFormNew';
import { useToast } from '../../contexts/ToastContext';
import { 
  crearInvestigacion,
  obtenerPeriodos,
  obtenerProductos,
  obtenerTiposInvestigacion,
  obtenerUsuarios
} from '../../api/supabase-investigaciones';
import { 
  InvestigacionFormData,
  Periodo,
  Producto,
  TipoInvestigacion,
  Usuario
} from '../../types/supabase-investigaciones';

const CrearInvestigacionPage: NextPage = () => {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estados para los catálogos
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tiposInvestigacion, setTiposInvestigacion] = useState<TipoInvestigacion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const cargarCatalogos = async () => {
      setLoadingData(true);
      
      try {
        const [
          respuestaPeriodos,
          respuestaProductos,
          respuestaTipos,
          respuestaUsuarios
        ] = await Promise.all([
          obtenerPeriodos(),
          obtenerProductos(),
          obtenerTiposInvestigacion(),
          obtenerUsuarios()
        ]);

        // Manejar períodos
        if (respuestaPeriodos.error) {
          console.error('Error cargando períodos:', respuestaPeriodos.error);
        } else {
          setPeriodos(respuestaPeriodos.data);
        }

        // Manejar productos
        if (respuestaProductos.error) {
          console.error('Error cargando productos:', respuestaProductos.error);
          showError('Error cargando datos', 'No se pudieron cargar los productos');
        } else {
          setProductos(respuestaProductos.data);
        }

        // Manejar tipos de investigación
        if (respuestaTipos.error) {
          console.error('Error cargando tipos:', respuestaTipos.error);
          showError('Error cargando datos', 'No se pudieron cargar los tipos de investigación');
        } else {
          setTiposInvestigacion(respuestaTipos.data);
        }

        // Manejar usuarios
        if (respuestaUsuarios.error) {
          console.error('Error cargando usuarios:', respuestaUsuarios.error);
        } else {
          setUsuarios(respuestaUsuarios.data);
        }

      } catch (error) {
        console.error('Error general cargando catálogos:', error);
        showError('Error cargando datos', 'Hubo un problema cargando la información necesaria');
      } finally {
        setLoadingData(false);
      }
    };

    cargarCatalogos();
  }, [showError]);

  const handleSubmit = async (data: InvestigacionFormData) => {
    setLoading(true);
    
    try {
      const respuesta = await crearInvestigacion(data);
      
      if (respuesta.error) {
        throw new Error(respuesta.error);
      }

      showSuccess(
        'Investigación creada exitosamente',
        `La investigación "${data.nombre}" ha sido creada correctamente`
      );

      // Esperar un poco para mostrar el toast y luego navegar
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/investigaciones');
      
    } catch (error: any) {
      console.error('Error creando investigación:', error);
      showError(
        'Error al crear investigación',
        error.message || 'Ha ocurrido un error inesperado'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/investigaciones');
  };

  if (loadingData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando información...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Crear nueva investigación
                </h1>
                <p className="text-muted-foreground">
                  Completa la información para crear una nueva investigación
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-card rounded-lg shadow-sm p-6">
            <InvestigacionFormNew
              periodos={periodos}
              productos={productos}
              tiposInvestigacion={tiposInvestigacion}
              usuarios={usuarios}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CrearInvestigacionPage; 