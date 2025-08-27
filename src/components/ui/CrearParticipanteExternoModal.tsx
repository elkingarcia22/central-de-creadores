import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { obtenerUsuarios } from '../../api/supabase-investigaciones';
import { 
  SideModal, 
  Typography, 
  Button, 
  Input, 
  Select,
  Textarea,
  UserSelectorWithAvatar,
  Chip,
  MultiSelect,
  PageHeader
} from './index';
import FilterLabel from './FilterLabel';
import { UserIcon } from '../icons';

interface CrearParticipanteExternoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (participante: any) => void;
}

interface RolEmpresa {
  id: string;
  nombre: string;
}

interface Usuario {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

interface Empresa {
  id: string;
  nombre: string;
  kam_id: string;
}

interface Producto {
  id: string;
  nombre: string;
}

export default function CrearParticipanteExternoModal({
  isOpen,
  onClose,
  onSuccess
}: CrearParticipanteExternoModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rolEmpresaId: '',
    doleresNecesidades: '',
    descripcion: '',
    kamId: '',
    empresaId: '',
    productosRelacionados: [] as string[],
    estadoParticipante: ''
  });

  // Estados para datos de catálogo
  const [responsables, setResponsables] = useState<Usuario[]>([]);
  const [rolesEmpresa, setRolesEmpresa] = useState<RolEmpresa[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [estadosParticipante, setEstadosParticipante] = useState<{id: string, nombre: string}[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [kamEmpresa, setKamEmpresa] = useState<Usuario | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
    }
  }, [isOpen]);

  const cargarDatosIniciales = async () => {
    try {
      console.log('🔍 CrearParticipanteExternoModal - cargando datos iniciales');
      setLoading(true);
      await Promise.all([
        cargarResponsables(),
        cargarRolesEmpresa(),
        cargarEmpresas(),
        cargarEstadosParticipante(),
        cargarProductos()
      ]);
      console.log('✅ CrearParticipanteExternoModal - datos iniciales cargados');
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      showError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarResponsables = async () => {
    try {
      const response = await obtenerUsuarios();
      if (response.data) {
        setResponsables(response.data);
      } else {
        console.error('Error cargando responsables:', response.error);
      }
    } catch (error) {
      console.error('Error cargando responsables:', error);
    }
  };

  const cargarRolesEmpresa = async () => {
    try {
      console.log('🔍 Cargando roles de empresa...');
      const response = await fetch('/api/roles-empresa');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Roles de empresa cargados:', data.length);
        setRolesEmpresa(data);
      } else {
        console.error('❌ Error en respuesta de roles de empresa:', response.status);
      }
    } catch (error) {
      console.error('❌ Error cargando roles de empresa:', error);
    }
  };

  const cargarEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas');
      
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      } else {
        console.error('❌ Error en respuesta de empresas:', response.status);
        const errorText = await response.text();
        console.error('❌ Error detallado:', errorText);
      }
    } catch (error) {
      console.error('❌ Error cargando empresas:', error);
    }
  };

  const cargarEstadosParticipante = async () => {
    try {
      const response = await fetch('/api/estados-participante');
      if (response.ok) {
        const data = await response.json();
        setEstadosParticipante(data);
      }
    } catch (error) {
      console.error('Error cargando estados de participante:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      } else {
        console.error('Error en respuesta de productos:', response.status);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const cargarKamEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`/api/empresa-kam?empresaId=${empresaId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Si tenemos el kam_id pero no los datos del usuario, buscar el usuario directamente
        if (data.kam_id && !data.usuarios) {
          // Buscar el usuario en la lista de responsables
          const usuarioEncontrado = responsables.find(r => r.id === data.kam_id);
          if (usuarioEncontrado) {
            setKamEmpresa({
              id: usuarioEncontrado.id,
              full_name: usuarioEncontrado.full_name || usuarioEncontrado.email || 'Sin nombre',
              email: usuarioEncontrado.email || 'sin-email@ejemplo.com',
              avatar_url: usuarioEncontrado.avatar_url
            });
            // Auto-seleccionar el KAM
            setFormData(prev => ({
              ...prev,
              kamId: usuarioEncontrado.id
            }));
            return;
          } else {
            // Buscar el usuario directamente en la tabla usuarios
            try {
              const responseUsuario = await fetch(`/api/usuario-por-id?usuarioId=${data.kam_id}`);
              if (responseUsuario.ok) {
                const usuarioData = await responseUsuario.json();
                
                setKamEmpresa({
                  id: usuarioData.id,
                  full_name: usuarioData.nombre || usuarioData.correo || 'Sin nombre',
                  email: usuarioData.correo || 'sin-email@ejemplo.com',
                  avatar_url: usuarioData.foto_url
                });
                
                // Auto-seleccionar el KAM
                setFormData(prev => ({
                  ...prev,
                  kamId: usuarioData.id
                }));
                return;
              } else {
                console.warn('⚠️ Usuario no encontrado en tabla usuarios');
              }
            } catch (error) {
              console.error('❌ Error buscando usuario en tabla usuarios:', error);
            }
          }
        }
        
        // Si tenemos los datos del usuario directamente
        if (data.usuarios) {
          setKamEmpresa({
            id: data.usuarios.id,
            full_name: data.usuarios.nombre,
            email: data.usuarios.correo,
            avatar_url: data.usuarios.foto_url
          });
          // Auto-seleccionar el KAM
          setFormData(prev => ({
            ...prev,
            kamId: data.usuarios.id
          }));
        } else {
          console.warn('⚠️ No se encontró información del KAM');
          setKamEmpresa(null);
        }
      } else {
        console.error('Error cargando KAM de empresa:', response.status);
        setKamEmpresa(null);
      }
    } catch (error) {
      console.error('Error cargando KAM de empresa:', error);
      setKamEmpresa(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 CrearParticipanteExternoModal - handleSubmit ejecutado');
    console.log('🔍 FormData:', formData);
    
    if (!formData.nombre || !formData.rolEmpresaId) {
      console.log('❌ Validación fallida - nombre:', formData.nombre, 'rolEmpresaId:', formData.rolEmpresaId);
      showError('Por favor completa los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/participantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const nuevoParticipante = await response.json();
        showSuccess('Participante externo creado exitosamente');
        onSuccess(nuevoParticipante);
        handleClose();
      } else {
        const error = await response.json();
        showError(error.error || 'Error al crear participante externo');
      }
    } catch (error) {
      console.error('Error creando participante externo:', error);
      showError('Error al crear participante externo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nombre: '',
        email: '',
        rolEmpresaId: '',
        doleresNecesidades: '',
        descripcion: '',
        kamId: '',
        empresaId: '',
        productosRelacionados: [],
        estadoParticipante: ''
      });
      setKamEmpresa(null);
      onClose();
    }
  };

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          const e = new Event('submit') as any;
          handleSubmit(e);
        }}
        loading={loading}
        disabled={loading || !formData.nombre || !formData.rolEmpresaId}
      >
        Crear Participante
      </Button>
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={handleClose}
      width="lg"
      footer={footer}
      showCloseButton={false}
    >
      <div className="flex flex-col h-full -m-6">
        {/* Header con PageHeader */}
        <PageHeader
          title="Crear Participante Externo"
          variant="title-only"
          onClose={handleClose}
          icon={<UserIcon className="w-5 h-5" />}
        />

        {/* Contenido del formulario */}
        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FilterLabel>Nombre *</FilterLabel>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                nombre: e.target.value
              }))}
              placeholder="Nombre completo"
              disabled={loading}
              required
            />
          </div>
          <div>
            <FilterLabel>Email</FilterLabel>
            <Input
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              placeholder="email@ejemplo.com"
              disabled={loading}
              type="email"
            />
          </div>
        </div>

        <div className="w-full">
          <FilterLabel>Rol en la Empresa *</FilterLabel>
          <Select
            value={formData.rolEmpresaId}
            onChange={(value) => setFormData(prev => ({
              ...prev,
              rolEmpresaId: value as string
            }))}
            placeholder="Seleccionar rol"
            options={rolesEmpresa.map(r => ({
              value: r.id,
              label: r.nombre
            }))}
            disabled={loading}
            required
            fullWidth
          />
        </div>

        {/* Empresa en línea completa */}
        <div className="w-full">
          <FilterLabel>Empresa</FilterLabel>
          <Select
            value={formData.empresaId}
            onChange={(value) => {
              const empresaSeleccionada = empresas.find(e => e.id === value);
              setFormData(prev => ({
                ...prev,
                empresaId: value as string,
                kamId: '' // Resetear KAM hasta que se cargue
              }));
              
              // Log para debugging
              if (empresaSeleccionada) {
                // Cargar información del KAM si la empresa tiene uno
                if (empresaSeleccionada.kam_id) {
                  cargarKamEmpresa(value as string);
                } else {
                  setKamEmpresa(null);
                }
              } else {
                setKamEmpresa(null);
              }
            }}
            placeholder="Seleccionar empresa"
            options={empresas.map(e => ({
              value: e.id,
              label: e.nombre
            }))}
            disabled={loading}
            fullWidth
          />
        </div>

        {/* KAM en línea completa */}
        {formData.empresaId && (
          <div className="w-full">
            <FilterLabel>KAM</FilterLabel>
            <UserSelectorWithAvatar
              value={formData.kamId}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                kamId: value
              }))}
              users={responsables.map(r => ({
                id: r.id,
                full_name: r.full_name || r.email || 'Sin nombre',
                email: r.email || 'sin-email@ejemplo.com',
                avatar_url: r.avatar_url
              }))}
              placeholder="Seleccionar KAM"
              disabled={loading}
            />
            {kamEmpresa && (
              <div className="mt-1 text-xs text-gray-600">
                KAM asignado a la empresa: {kamEmpresa.full_name} ({kamEmpresa.email})
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FilterLabel>Estado del Participante</FilterLabel>
            <Select
              value={formData.estadoParticipante}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                estadoParticipante: value as string
              }))}
              placeholder="Seleccionar estado"
              options={estadosParticipante.map(e => ({
                value: e.id,
                label: e.nombre
              }))}
              disabled={loading}
              fullWidth
            />
          </div>

          <div>
            <FilterLabel>Productos Relacionados</FilterLabel>
            <MultiSelect
              value={formData.productosRelacionados}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                productosRelacionados: value as string[]
              }))}
              placeholder="Seleccionar productos"
              options={productos.map(p => ({
                value: p.id,
                label: p.nombre
              }))}
              disabled={loading}
              fullWidth
            />
          </div>
        </div>
        
        {/* Campos de texto amplio en filas separadas */}
        <div className="space-y-4">
          <div>
            <FilterLabel>Dolores y Necesidades</FilterLabel>
            <Textarea
              value={formData.doleresNecesidades}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                doleresNecesidades: e.target.value
              }))}
              placeholder="Describe los dolores y necesidades del participante, sus principales desafíos, problemas que enfrenta en su rol, etc..."
              disabled={loading}
              rows={4}
              fullWidth
            />
          </div>
          <div>
            <FilterLabel>Descripción</FilterLabel>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                descripcion: e.target.value
              }))}
              placeholder="Descripción detallada del participante, su experiencia, contexto, información adicional relevante..."
              disabled={loading}
              rows={4}
              fullWidth
            />
          </div>
        </div>
            </form>
          </div>
        </div>
      </SideModal>
  );
} 