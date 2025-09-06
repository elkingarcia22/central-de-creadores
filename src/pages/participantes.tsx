import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useRol } from '../contexts/RolContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useFastUser } from '../contexts/FastUserContext';
import { supabase } from '../api/supabase';

import { Layout, PageHeader, List } from '../components/ui';
import Typography from '../components/ui/Typography';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Chip from '../components/ui/Chip';
import DataTable from '../components/ui/DataTable';
import ActionsMenu from '../components/ui/ActionsMenu';
import Tabs from '../components/ui/Tabs';
import FilterDrawer from '../components/ui/FilterDrawer';
import ParticipantesUnifiedContainer from '../components/participantes/ParticipantesUnifiedContainer';
import CrearParticipanteExternoModal from '../components/ui/CrearParticipanteExternoModal';
import CrearParticipanteInternoModal from '../components/ui/CrearParticipanteInternoModal';
import CrearParticipanteFriendFamilyModal from '../components/ui/CrearParticipanteFriendFamilyModal';
import EditarParticipanteModal from '../components/ui/EditarParticipanteModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import ErrorEliminacionModal from '../components/ui/ErrorEliminacionModal';
import { DolorSideModal } from '../components/ui';
import { SeleccionarCategoriaPerfilamientoModal } from '../components/participantes/SeleccionarCategoriaPerfilamientoModal';
import { CrearPerfilamientoModal } from '../components/participantes/CrearPerfilamientoModal';
import { SeguimientosTab } from '../components/participantes/SeguimientosTab';
import SeguimientoSideModal from '../components/ui/SeguimientoSideModal';
import { SearchIcon, PlusIcon, UserIcon, ParticipantesIcon, BuildingIcon, UsersIcon, CheckCircleIcon, EyeIcon, EditIcon, TrashIcon, MoreVerticalIcon, FilterIcon, MessageIcon, AlertTriangleIcon, ClipboardListIcon } from '../components/icons';
import { getChipVariant, getChipText } from '../utils/chipUtils';
import AnimatedCounter from '../components/ui/AnimatedCounter';

// Interfaces para participantes
interface Participante {
  id: string;
  nombre: string;
  email?: string;
  tipo: 'externo' | 'interno' | 'friend_family';
  empresa_nombre?: string;
  rol_empresa?: string;
  departamento_nombre?: string;
  estado_participante?: string;
  productos_relacionados?: string[];
  fecha_ultima_participacion?: string;
  total_participaciones?: number;
  comentarios?: string;
  doleres_necesidades?: string;
  created_at: string;
  updated_at: string;
}

// Interfaces para filtros de participantes
interface FilterValuesParticipantes {
  busqueda?: string;
  tipo?: string | 'todos';
  estado_participante?: string | 'todos';
  rol_empresa?: string | 'todos';
  empresa?: string | 'todos';
  departamento?: string | 'todos';
  fecha_registro_desde?: string;
  fecha_registro_hasta?: string;
  fecha_ultima_participacion_desde?: string;
  fecha_ultima_participacion_hasta?: string;
  total_participaciones_min?: string;
  total_participaciones_max?: string;
  tiene_email?: string | 'todos'; // 'todos' | 'con_email' | 'sin_email'
  tiene_productos?: string | 'todos'; // 'todos' | 'con_productos' | 'sin_productos'
}

export default function ParticipantesPage() {
  const { rolSeleccionado } = useRol();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { userId, isAuthenticated } = useFastUser();
  const router = useRouter();
  
  // Estados principales
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('externos');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showModalExterno, setShowModalExterno] = useState(false);
  const [showModalInterno, setShowModalInterno] = useState(false);
  const [showModalFriendFamily, setShowModalFriendFamily] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showModalErrorEliminar, setShowModalErrorEliminar] = useState(false);
  const [showModalCrearDolor, setShowModalCrearDolor] = useState(false);
  const [showModalPerfilamiento, setShowModalPerfilamiento] = useState(false);
  const [showModalCrearPerfilamiento, setShowModalCrearPerfilamiento] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [participanteParaEditar, setParticipanteParaEditar] = useState<any>(null);
  const [participanteParaEliminar, setParticipanteParaEliminar] = useState<any>(null);
  const [participanteParaCrearDolor, setParticipanteParaCrearDolor] = useState<any>(null);
  const [participanteParaPerfilamiento, setParticipanteParaPerfilamiento] = useState<any>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<any>(null);
  const [participantePerfilamientoTemp, setParticipantePerfilamientoTemp] = useState<any>(null);
  const [errorEliminacion, setErrorEliminacion] = useState<any>(null);
  const [eliminandoParticipante, setEliminandoParticipante] = useState(false);
  const [showCrearSeguimientoModal, setShowCrearSeguimientoModal] = useState(false);
  const [participanteParaSeguimiento, setParticipanteParaSeguimiento] = useState<any>(null);
  const [seguimientos, setSeguimientos] = useState<any[]>([]);
  const [seguimientosLoading, setSeguimientosLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [investigacionesModal, setInvestigacionesModal] = useState<any[]>([]);
  
  // Estados para catálogos de filtros
  const [estadosParticipante, setEstadosParticipante] = useState<Array<{ value: string; label: string }>>([]);
  const [rolesEmpresa, setRolesEmpresa] = useState<Array<{ value: string; label: string }>>([]);
  const [empresas, setEmpresas] = useState<Array<{ value: string; label: string }>>([]);
  const [departamentos, setDepartamentos] = useState<Array<{ value: string; label: string }>>([]);
  
  // Estados para filtros de seguimientos
  const [responsables, setResponsables] = useState<Array<{ value: string; label: string }>>([]);
  const [investigaciones, setInvestigaciones] = useState<Array<{ value: string; label: string }>>([]);
  const [participantesFiltros, setParticipantesFiltros] = useState<Array<{ value: string; label: string }>>([]);
  
  // Estados para filtros específicos por tipo
  const [filtersExternos, setFiltersExternos] = useState<FilterValuesParticipantes>({
    busqueda: '',
    estado_participante: 'todos',
    rol_empresa: 'todos',
    empresa: 'todos',
    fecha_ultima_participacion_desde: '',
    fecha_ultima_participacion_hasta: '',
    total_participaciones_min: '',
    total_participaciones_max: '',
    tiene_email: 'todos',
    tiene_productos: 'todos'
  });
  
  const [filtersInternos, setFiltersInternos] = useState<FilterValuesParticipantes>({
    busqueda: '',
    estado_participante: 'todos',
    rol_empresa: 'todos',
    departamento: 'todos',
    fecha_ultima_participacion_desde: '',
    fecha_ultima_participacion_hasta: '',
    total_participaciones_min: '',
    total_participaciones_max: '',
    tiene_email: 'todos'
  });
  
  const [filtersFriendFamily, setFiltersFriendFamily] = useState<FilterValuesParticipantes>({
    busqueda: '',
    estado_participante: 'todos',
    rol_empresa: 'todos',
    departamento: 'todos',
    fecha_ultima_participacion_desde: '',
    fecha_ultima_participacion_hasta: '',
    total_participaciones_min: '',
    total_participaciones_max: '',
    tiene_email: 'todos'
  });

  // Estados para selección múltiple
  const [selectedParticipantes, setSelectedParticipantes] = useState<string[]>([]);
  const [clearTableSelection, setClearTableSelection] = useState(false);

  // Callback para manejar cambios de selección
  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedParticipantes(selectedIds);
  }, []);

  // Debug: monitorear cambios en showDropdown
  useEffect(() => {
    console.log('🔍 showDropdown cambió a:', showDropdown);
  }, [showDropdown]);

  // Cerrar dropdown solo cuando se haga clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDropdown && !target.closest('.dropdown-container')) {
        console.log('🔍 Clic fuera del dropdown, cerrando...');
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Acciones masivas
  const bulkActions = [
    {
      label: 'Eliminar Seleccionados',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (selectedIds: string[]) => {
        if (selectedIds.length === 0) {
          return;
        }
        // Implementar eliminación masiva
        console.log('Eliminando participantes:', selectedIds);
      },
      className: 'text-destructive hover:text-destructive/80 hover:bg-destructive/10 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200'
    }
  ];

  const [filters, setFilters] = useState<FilterValuesParticipantes>({
    busqueda: '',
    tipo: 'todos',
    estado_participante: 'todos',
    rol_empresa: 'todos',
    empresa: 'todos',
    departamento: 'todos',
    fecha_registro_desde: '',
    fecha_registro_hasta: '',
    fecha_ultima_participacion_desde: '',
    fecha_ultima_participacion_hasta: '',
    total_participaciones_min: '',
    total_participaciones_max: '',
    tiene_email: 'todos',
    tiene_productos: 'todos'
  });

  // Cargar seguimientos
  const cargarSeguimientos = useCallback(async () => {
    try {
      setSeguimientosLoading(true);
      console.log('🔍 Cargando seguimientos...');
      
      const response = await fetch('/api/seguimientos?all=true');
      if (!response.ok) {
        throw new Error('Error al cargar seguimientos');
      }
      
      const result = await response.json();
      console.log('✅ Seguimientos cargados:', result.data?.length || 0);
      setSeguimientos(result.data || []);
    } catch (error) {
      console.error('❌ Error cargando seguimientos:', error);
      showError('Error al cargar seguimientos');
      setSeguimientos([]);
    } finally {
      setSeguimientosLoading(false);
    }
  }, [showError]);

  // Cargar catálogos para filtros de seguimientos
  const cargarCatalogosSeguimientos = useCallback(async () => {
    try {
      // Cargar responsables (usuarios)
      const responseUsuarios = await fetch('/api/usuarios');
      if (responseUsuarios.ok) {
        const dataUsuarios = await responseUsuarios.json();
        const usuariosArray = Array.isArray(dataUsuarios) ? dataUsuarios : (dataUsuarios?.usuarios || []);
        setUsuarios(usuariosArray); // Guardar usuarios completos
        setResponsables(usuariosArray.map((usuario: any) => ({
          value: usuario.id,
          label: usuario.full_name || usuario.nombre || 'Sin nombre'
        })));
      }

      // Cargar investigaciones únicas de los seguimientos
      const investigacionesUnicas = [...new Set(seguimientos.map(s => s.investigacion_nombre).filter(Boolean))];
      setInvestigaciones(investigacionesUnicas.map(nombre => ({
        value: nombre,
        label: nombre
      })));

      // Cargar todas las investigaciones para el modal
      const responseInvestigaciones = await fetch('/api/investigaciones');
      if (responseInvestigaciones.ok) {
        const dataInvestigaciones = await responseInvestigaciones.json();
        setInvestigacionesModal(dataInvestigaciones || []);
      }

      // Cargar participantes únicos de los seguimientos
      const participantesUnicos = [...new Set(seguimientos.map(s => s.participante_externo).filter(Boolean))];
      setParticipantesFiltros(participantesUnicos.map(participante => ({
        value: participante.id,
        label: participante.nombre || 'Sin nombre'
      })));
    } catch (error) {
      console.error('Error cargando catálogos de seguimientos:', error);
    }
  }, [seguimientos]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarParticipantes();
    cargarCatalogos();
    cargarSeguimientos();
  }, [cargarSeguimientos]);

  // Cargar catálogos de seguimientos cuando cambien los seguimientos
  useEffect(() => {
    if (seguimientos.length > 0) {
      cargarCatalogosSeguimientos();
    }
  }, [cargarCatalogosSeguimientos]);

  // Cargar usuarios cuando se abra el modal de seguimiento
  useEffect(() => {
    if (showCrearSeguimientoModal && usuarios.length === 0) {
      cargarCatalogosSeguimientos();
    }
  }, [showCrearSeguimientoModal, usuarios.length, cargarCatalogosSeguimientos]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const cargarParticipantes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/participantes-todos');
      if (response.ok) {
              const data = await response.json();
      console.log('🔍 Datos recibidos de la API:', data);
      console.log('🔍 Número de participantes:', data.participantes?.length || 0);
      console.log('🔍 Primer participante:', data.participantes?.[0]);
      setParticipantes(data.participantes || []);
      } else {
        console.error('Error cargando participantes:', response.status);
        showError('Error al cargar participantes');
      }
    } catch (error) {
      console.error('Error cargando participantes:', error);
      showError('Error al cargar participantes');
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      // Cargar estados de participante
      const responseEstados = await fetch('/api/estados-participante');
      if (responseEstados.ok) {
        const dataEstados = await responseEstados.json();
        console.log('🔍 Estados cargados:', dataEstados);
        if (Array.isArray(dataEstados)) {
          setEstadosParticipante([
            { value: 'todos', label: 'Todos' },
            ...dataEstados.map((estado: any) => ({ value: estado.nombre, label: estado.nombre }))
          ]);
        } else {
          console.error('❌ Estados no es un array:', dataEstados);
          setEstadosParticipante([
            { value: 'todos', label: 'Todos' },
            { value: 'Disponible', label: 'Disponible' },
            { value: 'En enfriamiento', label: 'En enfriamiento' },
            { value: 'No disponible', label: 'No disponible' }
          ]);
        }
      }

      // Cargar roles de empresa
      const responseRoles = await fetch('/api/roles-empresa');
      if (responseRoles.ok) {
        const dataRoles = await responseRoles.json();
        if (Array.isArray(dataRoles)) {
          setRolesEmpresa([
            { value: 'todos', label: 'Todos' },
            ...dataRoles.map((rol: any) => ({ value: rol.nombre, label: rol.nombre }))
          ]);
        } else {
          console.error('❌ Roles no es un array:', dataRoles);
          setRolesEmpresa([{ value: 'todos', label: 'Todos' }]);
        }
      }

      // Cargar empresas
      const responseEmpresas = await fetch('/api/empresas');
      if (responseEmpresas.ok) {
        const dataEmpresas = await responseEmpresas.json();
        if (Array.isArray(dataEmpresas)) {
          setEmpresas([
            { value: 'todos', label: 'Todas' },
            ...dataEmpresas.map((empresa: any) => ({ value: empresa.nombre, label: empresa.nombre }))
          ]);
        } else {
          console.error('❌ Empresas no es un array:', dataEmpresas);
          setEmpresas([{ value: 'todos', label: 'Todas' }]);
        }
      }

      // Cargar departamentos
      const responseDepartamentos = await fetch('/api/departamentos');
      if (responseDepartamentos.ok) {
        const dataDepartamentos = await responseDepartamentos.json();
        console.log('🔍 Departamentos cargados:', dataDepartamentos);
        
        // El endpoint devuelve un objeto con { departamentos: [], departamentosAgrupados: {} }
        let departamentosArray = [];
        if (dataDepartamentos && dataDepartamentos.departamentos && Array.isArray(dataDepartamentos.departamentos)) {
          departamentosArray = dataDepartamentos.departamentos;
        } else if (Array.isArray(dataDepartamentos)) {
          // Si la respuesta es directamente un array
          departamentosArray = dataDepartamentos;
        } else {
          console.error('❌ Departamentos no tiene el formato esperado:', dataDepartamentos);
          departamentosArray = [];
        }
        
        setDepartamentos([
          { value: 'todos', label: 'Todos' },
          ...departamentosArray.map((departamento: any) => ({ value: departamento.nombre, label: departamento.nombre }))
        ]);
      }
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      
      // Establecer valores por defecto en caso de error
      setEstadosParticipante([
        { value: 'todos', label: 'Todos' },
        { value: 'Disponible', label: 'Disponible' },
        { value: 'En enfriamiento', label: 'En enfriamiento' },
        { value: 'No disponible', label: 'No disponible' }
      ]);
      setRolesEmpresa([{ value: 'todos', label: 'Todos' }]);
      setEmpresas([{ value: 'todos', label: 'Todas' }]);
      setDepartamentos([{ value: 'todos', label: 'Todos' }]);
    }
  };

  // Filtrar participantes por tipo
  const participantesExternos = participantes.filter(p => p.tipo === 'externo');
  const participantesInternos = participantes.filter(p => p.tipo === 'interno');
  const participantesFriendFamily = participantes.filter(p => p.tipo === 'friend_family');
  
  console.log('🔍 Filtrado de participantes:', {
    total: participantes.length,
    externos: participantesExternos.length,
    internos: participantesInternos.length,
    friendFamily: participantesFriendFamily.length,
    activeTab
  });
  
  console.log('🔍 Primer participante externo:', participantesExternos[0]);
  console.log('🔍 Primer participante interno:', participantesInternos[0]);
  console.log('🔍 Primer participante friend & family:', participantesFriendFamily[0]);

  // Función para filtrar participantes según el tab activo y filtros específicos
  const getFilteredParticipantes = (tipo: string) => {
    let participantesFiltrados = participantes.filter(p => p.tipo === tipo);
    
    // Obtener filtros específicos según el tipo
    let currentFilters: FilterValuesParticipantes;
    switch (tipo) {
      case 'externo':
        currentFilters = filtersExternos;
        break;
      case 'interno':
        currentFilters = filtersInternos;
        break;
      case 'friend_family':
        currentFilters = filtersFriendFamily;
        break;
      default:
        currentFilters = filters;
    }
    
    // Aplicar filtros de búsqueda
    if (currentFilters.busqueda) {
      participantesFiltrados = participantesFiltrados.filter(participante => 
        participante.nombre.toLowerCase().includes(currentFilters.busqueda!.toLowerCase()) ||
        participante.email?.toLowerCase().includes(currentFilters.busqueda!.toLowerCase()) ||
        participante.empresa_nombre?.toLowerCase().includes(currentFilters.busqueda!.toLowerCase()) ||
        participante.departamento_nombre?.toLowerCase().includes(currentFilters.busqueda!.toLowerCase())
      );
    }

    // Aplicar filtros específicos
    // Estado solo para participantes externos
    if (tipo === 'externo' && currentFilters.estado_participante && currentFilters.estado_participante !== 'todos') {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.estado_participante === currentFilters.estado_participante
      );
    }

    if (currentFilters.rol_empresa && currentFilters.rol_empresa !== 'todos') {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.rol_empresa === currentFilters.rol_empresa
      );
    }

    if (currentFilters.empresa && currentFilters.empresa !== 'todos') {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.empresa_nombre === currentFilters.empresa
      );
    }

    if (currentFilters.departamento && currentFilters.departamento !== 'todos') {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.departamento_nombre === currentFilters.departamento
      );
    }

    if (currentFilters.fecha_ultima_participacion_desde) {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.fecha_ultima_participacion && new Date(p.fecha_ultima_participacion) >= new Date(currentFilters.fecha_ultima_participacion_desde!)
      );
    }

    if (currentFilters.fecha_ultima_participacion_hasta) {
      participantesFiltrados = participantesFiltrados.filter(p => 
        p.fecha_ultima_participacion && new Date(p.fecha_ultima_participacion) <= new Date(currentFilters.fecha_ultima_participacion_hasta!)
      );
    }

    if (currentFilters.total_participaciones_min) {
      participantesFiltrados = participantesFiltrados.filter(p => 
        (p.total_participaciones || 0) >= parseInt(currentFilters.total_participaciones_min!)
      );
    }

    if (currentFilters.total_participaciones_max) {
      participantesFiltrados = participantesFiltrados.filter(p => 
        (p.total_participaciones || 0) <= parseInt(currentFilters.total_participaciones_max!)
      );
    }

    if (currentFilters.tiene_email && currentFilters.tiene_email !== 'todos') {
      if (currentFilters.tiene_email === 'con_email') {
        participantesFiltrados = participantesFiltrados.filter(p => p.email);
      } else {
        participantesFiltrados = participantesFiltrados.filter(p => !p.email);
      }
    }

    if (currentFilters.tiene_productos && currentFilters.tiene_productos !== 'todos') {
      if (currentFilters.tiene_productos === 'con_productos') {
        participantesFiltrados = participantesFiltrados.filter(p => 
          p.productos_relacionados && p.productos_relacionados.length > 0
        );
      } else {
        participantesFiltrados = participantesFiltrados.filter(p => 
          !p.productos_relacionados || p.productos_relacionados.length === 0
        );
      }
    }

    return participantesFiltrados;
  };

  // Obtener participantes filtrados según el tab activo
  const filteredParticipantes = getFilteredParticipantes(activeTab);

  // Calcular métricas
  const metricas = {
    total: participantes.length,
    externos: participantes.filter(p => p.tipo === 'externo').length,
    internos: participantes.filter(p => p.tipo === 'interno').length,
    friendFamily: participantes.filter(p => p.tipo === 'friend_family').length,
    alcance: participantes.filter(p => (p.total_participaciones || 0) > 0).length,
    inactivos: participantes.filter(p => p.estado_participante === 'Inactivo').length,
    porcentajeAlcance: participantes.length > 0 ? Math.round((participantes.filter(p => (p.total_participaciones || 0) > 0).length / participantes.length) * 100) : 0
  };

  // Acciones
  const handleCrearParticipante = () => {
    // Esta función ya no se usa directamente, se usa el dropdown
  };

  const handleCrearParticipanteExterno = () => {
    console.log('🔍 handleCrearParticipanteExterno llamado');
    console.log('🔍 showModalExterno antes:', showModalExterno);
    setShowModalExterno(true);
    console.log('🔍 showModalExterno después:', true);
  };

  const handleCrearParticipanteInterno = () => {
    console.log('🔍 handleCrearParticipanteInterno llamado');
    console.log('🔍 showModalInterno antes:', showModalInterno);
    setShowModalInterno(true);
    console.log('🔍 showModalInterno después:', true);
  };

  const handleCrearParticipanteFriendFamily = () => {
    console.log('🔍 handleCrearParticipanteFriendFamily llamado');
    console.log('🔍 showModalFriendFamily antes:', showModalFriendFamily);
    setShowModalFriendFamily(true);
    console.log('🔍 showModalFriendFamily después:', true);
  };

  const handleParticipanteCreado = () => {
    cargarParticipantes();
  };

  const handleVerParticipante = (participante: Participante) => {
    router.push(`/participantes/${participante.id}`);
  };

  const handleEditarParticipante = (participante: Participante) => {
    setParticipanteParaEditar(participante);
    setShowModalEditar(true);
  };

  const handleEliminarParticipante = (participante: Participante) => {
    setParticipanteParaEliminar(participante);
    setShowModalEliminar(true);
  };

  const confirmarEliminacion = async () => {
    if (!participanteParaEliminar) return;
    
    try {
      setEliminandoParticipante(true);
      
      const response = await fetch(`/api/participantes/eliminar?id=${participanteParaEliminar.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Participante eliminado correctamente');
        setShowModalEliminar(false);
        setParticipanteParaEliminar(null);
        // Recargar la lista de participantes
        cargarParticipantes();
      } else {
        const errorData = await response.json();
        
        // Si es un error de participaciones asociadas, mostrar modal específico
        if (errorData.participaciones && errorData.participaciones > 0) {
          setErrorEliminacion({
            message: errorData.error,
            detail: errorData.detail,
            participaciones: errorData.participaciones,
            investigaciones: errorData.investigaciones
          });
          setShowModalEliminar(false);
          setShowModalErrorEliminar(true);
        } else {
          showError(errorData.error || 'Error al eliminar participante');
          if (errorData.detail) {
            showError(errorData.detail);
          }
        }
      }
    } catch (error) {
      console.error('Error eliminando participante:', error);
      showError('Error al eliminar participante');
    } finally {
      setEliminandoParticipante(false);
    }
  };

  const handleCrearDolor = (participante: Participante) => {
    // Abrir modal de crear dolor
    setParticipanteParaCrearDolor(participante);
    setShowModalCrearDolor(true);
  };

  const handleDolorGuardado = async (dolorData: any) => {
    try {
      console.log('🔍 handleDolorGuardado llamado');
      console.log('🔍 participanteParaCrearDolor:', participanteParaCrearDolor);
      console.log('🔍 dolorData:', dolorData);
      
      if (!participanteParaCrearDolor?.id) {
        console.error('❌ Error: No hay participante seleccionado');
        showError('Error: No hay participante seleccionado');
        return;
      }
      
      // Validar datos del dolor
      if (!dolorData.categoria_id || !dolorData.titulo) {
        console.error('❌ Error: Datos del dolor incompletos');
        showError('Error: Categoría y título son requeridos');
        return;
      }
      
      // Verificar autenticación usando el contexto
      console.log('🔍 Estado de autenticación:', { isAuthenticated, userId });
      
      if (!isAuthenticated || !userId) {
        console.error('❌ Error: Usuario no autenticado');
        showError('Error: Usuario no autenticado. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      // Llamar directamente al API real para crear el dolor
      console.log('🔍 Llamando al API real...');
      const response = await fetch(`/api/participantes/${participanteParaCrearDolor.id}/dolores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify(dolorData),
      });

      console.log('🔍 Respuesta del API real:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dolor creado exitosamente:', result);
        
        // Cerrar modal y mostrar mensaje de éxito
        setShowModalCrearDolor(false);
        setParticipanteParaCrearDolor(null);
        showSuccess('Dolor registrado exitosamente');
      } else {
        let errorMessage = 'Error al crear el dolor';
        try {
          const errorData = await response.json();
          console.log('❌ Error del API real:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.log('❌ Error parseando respuesta:', parseError);
        }
        showError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error al crear dolor:', error);
      showError('Error al crear el dolor: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleCrearPerfilamiento = (participante: Participante) => {
    // Guardar participante en estado temporal y abrir modal de categoría
    setParticipantePerfilamientoTemp(participante);
    setParticipanteParaPerfilamiento(participante);
    setShowModalPerfilamiento(true);
  };

  const handleCrearSeguimiento = (participante: Participante) => {
    setParticipanteParaSeguimiento(participante);
    setShowCrearSeguimientoModal(true);
  };

  // Funciones para manejar filtros
  const handleOpenFilters = () => {
    setShowFilterDrawer(true);
  };

  const handleCloseFilters = () => {
    setShowFilterDrawer(false);
  };

  const handleFiltersChange = (newFilters: FilterValuesParticipantes) => {
    console.log('🔍 handleFiltersChange llamado:', {
      activeTab,
      newFilters,
      estado_participante: newFilters.estado_participante
    });
    
    // Actualizar filtros según el tab activo
    switch (activeTab) {
      case 'externos':
        console.log('🔍 Actualizando filtersExternos');
        setFiltersExternos(newFilters);
        break;
      case 'internos':
        console.log('🔍 Actualizando filtersInternos');
        setFiltersInternos(newFilters);
        break;
      case 'friend_family':
        console.log('🔍 Actualizando filtersFriendFamily');
        setFiltersFriendFamily(newFilters);
        break;
      default:
        console.log('🔍 Actualizando filters general');
        setFilters(newFilters);
    }
  };

  const getActiveFiltersCount = () => {
    // Obtener filtros según el tab activo
    let currentFilters: FilterValuesParticipantes;
    switch (activeTab) {
      case 'externos':
        currentFilters = filtersExternos;
        break;
      case 'internos':
        currentFilters = filtersInternos;
        break;
      case 'friend_family':
        currentFilters = filtersFriendFamily;
        break;
      default:
        currentFilters = filters;
    }
    
    let count = 0;
    if (currentFilters.busqueda) count++;
    // Estado solo para participantes externos
    if (activeTab === 'externos' && currentFilters.estado_participante && currentFilters.estado_participante !== 'todos') count++;
    if (currentFilters.rol_empresa && currentFilters.rol_empresa !== 'todos') count++;
    if (currentFilters.empresa && currentFilters.empresa !== 'todos') count++;
    if (currentFilters.departamento && currentFilters.departamento !== 'todos') count++;
    if (currentFilters.fecha_ultima_participacion_desde) count++;
    if (currentFilters.fecha_ultima_participacion_hasta) count++;
    if (currentFilters.total_participaciones_min) count++;
    if (currentFilters.total_participaciones_max) count++;
    if (currentFilters.tiene_email && currentFilters.tiene_email !== 'todos') count++;
    if (currentFilters.tiene_productos && currentFilters.tiene_productos !== 'todos') count++;
    return count;
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'externo': return <BuildingIcon className="w-4 h-4" />;
      case 'interno': return <UsersIcon className="w-4 h-4" />;
      case 'friend_family': return <UserIcon className="w-4 h-4" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };



  const getEstadoColor = (estado?: string): any => {
    if (!estado) return 'default';
    return getChipVariant(estado);
  };

  // Definición de columnas para participantes externos
  const columnsExternos = [
    {
      key: 'nombre',
      label: 'Participante',
      sortable: true,
      width: 'w-80',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="space-y-1">
            <div 
              className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary transition-colors"
              onClick={() => router.push(`/participantes/${row.id}`)}
            >
              {row.nombre || 'Sin nombre'}
            </div>
            {row.email && (
              <div className="text-sm text-gray-500">
                {row.email}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'empresa',
      label: 'Empresa',
      sortable: false,
      width: 'w-64',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.empresa_nombre || 'Sin empresa'}
          </div>
        );
      }
    },
    {
      key: 'rol_empresa',
      label: 'Rol',
      sortable: false,
      width: 'w-48',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.rol_empresa || 'Sin rol'}
          </div>
        );
      }
    },
    {
      key: 'estado_participante',
      label: 'Estado',
      sortable: true,
      width: 'w-32',
      render: (value: any, row: any) => {
        if (!row || !row.estado_participante) {
          return <div className="text-gray-400">-</div>;
        }
        return (
          <Chip 
            variant={getChipVariant(row.estado_participante) as any} 
            size="sm"
            className="whitespace-nowrap"
          >
            {getChipText(row.estado_participante)}
          </Chip>
        );
      }
    },
    {
      key: 'total_participaciones',
      label: 'Participaciones',
      sortable: true,
      width: 'w-32',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.total_participaciones || 0}
            </div>
            <div className="text-xs text-gray-500">sesiones</div>
          </div>
        );
      }
    },
    {
      key: 'fecha_ultima_participacion',
      label: 'Última Participación',
      sortable: true,
      width: 'w-40',
      render: (value: any, row: any) => {
        if (!row || !row.fecha_ultima_participacion) {
          return <div className="text-gray-400">Sin participaciones</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(row.fecha_ultima_participacion).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      }
    }
  ];

  // Definición de columnas para participantes internos
  const columnsInternos = [
    {
      key: 'nombre',
      label: 'Participante',
      sortable: true,
      width: 'w-80',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="space-y-1">
            <div 
              className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary transition-colors"
              onClick={() => router.push(`/participantes/${row.id}`)}
            >
              {row.nombre || 'Sin nombre'}
            </div>
            {row.email && (
              <div className="text-sm text-gray-500">
                {row.email}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'departamento',
      label: 'Departamento',
      sortable: false,
      width: 'w-64',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.departamento_nombre || 'Sin departamento'}
          </div>
        );
      }
    },
    {
      key: 'rol_empresa',
      label: 'Rol',
      sortable: false,
      width: 'w-48',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.rol_empresa || 'Sin rol'}
          </div>
        );
      }
    },
    {
      key: 'total_participaciones',
      label: 'Participaciones',
      sortable: true,
      width: 'w-32',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.total_participaciones || 0}
            </div>
            <div className="text-xs text-gray-500">sesiones</div>
          </div>
        );
      }
    },
    {
      key: 'fecha_ultima_participacion',
      label: 'Última Participación',
      sortable: true,
      width: 'w-40',
      render: (value: any, row: any) => {
        if (!row || !row.fecha_ultima_participacion) {
          return <div className="text-gray-400">Sin participaciones</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(row.fecha_ultima_participacion).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      }
    }
  ];

  // Definición de columnas para friend & family (similar a internos)
  const columnsFriendFamily = [
    {
      key: 'nombre',
      label: 'Participante',
      sortable: true,
      width: 'w-80',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="space-y-1">
            <div 
              className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary transition-colors"
              onClick={() => router.push(`/participantes/${row.id}`)}
            >
              {row.nombre || 'Sin nombre'}
            </div>
            {row.email && (
              <div className="text-sm text-gray-500">
                {row.email}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'departamento',
      label: 'Departamento',
      sortable: false,
      width: 'w-64',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.departamento_nombre || 'Sin departamento'}
          </div>
        );
      }
    },
    {
      key: 'rol_empresa',
      label: 'Rol',
      sortable: false,
      width: 'w-48',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.rol_empresa || 'Sin rol'}
          </div>
        );
      }
    },
    {
      key: 'total_participaciones',
      label: 'Participaciones',
      sortable: true,
      width: 'w-32',
      render: (value: any, row: any) => {
        if (!row) {
          return <div className="text-gray-400">Sin datos</div>;
        }
        return (
          <div className="text-center">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.total_participaciones || 0}
            </div>
            <div className="text-xs text-gray-500">sesiones</div>
          </div>
        );
      }
    },
    {
      key: 'fecha_ultima_participacion',
      label: 'Última Participación',
      sortable: true,
      width: 'w-40',
      render: (value: any, row: any) => {
        if (!row || !row.fecha_ultima_participacion) {
          return <div className="text-gray-400">Sin participaciones</div>;
        }
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(row.fecha_ultima_participacion).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      }
    }
  ];

  // Función para obtener las columnas según el tab activo
  const getColumns = () => {
    switch (activeTab) {
      case 'externos':
        return columnsExternos;
      case 'internos':
        return columnsInternos;
      case 'friend_family':
        return columnsFriendFamily;
      default:
        return columnsExternos;
    }
  };

  return (
    <Layout rol={rolSeleccionado}>
      <div className="py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header con PageHeader estándar y dropdown integrado */}
          <div className="relative">
            <PageHeader
              title="Participantes"
              subtitle="Gestiona todos los participantes de tu portafolio"
              color="purple"
              primaryAction={{
                label: "Nuevo Participante",
                onClick: () => setShowDropdown(!showDropdown),
                variant: "primary",
                icon: <PlusIcon className="w-4 h-4" />
              }}
            />
            
            {/* Dropdown integrado en el header - posicionamiento preciso */}
            {showDropdown && (
              <div 
                className="dropdown-container absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🔍 Dropdown clickeado, previniendo cierre');
                }}
              >
                <button
                  onClick={() => {
                    console.log('🔍 Botón Cliente Externo clickeado');
                    handleCrearParticipanteExterno();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                >
                  <BuildingIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span>Cliente Externo</span>
                </button>
                
                <button
                  onClick={() => {
                    console.log('🔍 Botón Cliente Interno clickeado');
                    handleCrearParticipanteInterno();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                >
                  <UsersIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span>Cliente Interno</span>
                </button>
                
                <button
                  onClick={() => {
                    console.log('🔍 Botón Friend and Family clickeado');
                    handleCrearParticipanteFriendFamily();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                >
                  <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span>Friend and Family</span>
                </button>
              </div>
            )}
          </div>

          {/* Estadísticas del Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Participantes */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-foreground">
                    <AnimatedCounter 
                      value={metricas.total} 
                      duration={2000}
                      className="text-foreground"
                    />
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Total Participantes
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-muted ml-4">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </Card>

            {/* Externos */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-foreground">
                    <AnimatedCounter 
                      value={metricas.externos} 
                      duration={2000}
                      className="text-foreground"
                    />
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Externos
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-muted ml-4">
                  <BuildingIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </Card>

            {/* Internos */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-foreground">
                    <AnimatedCounter 
                      value={metricas.internos} 
                      duration={2000}
                      className="text-foreground"
                    />
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Internos
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-muted ml-4">
                  <UsersIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </Card>

            {/* Alcance */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" weight="bold" className="text-foreground">
                    <AnimatedCounter 
                      value={metricas.alcance} 
                      duration={2000}
                      className="text-foreground"
                    />
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Alcance ({metricas.porcentajeAlcance}%)
                  </Typography>
                </div>
                <div className="p-2 rounded-lg bg-muted ml-4">
                  <CheckCircleIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs de Participantes */}
          {/* Contenedor unificado de tabla, buscador y filtros */}
          {(() => {
            console.log('🔍 Renderizando ParticipantesUnifiedContainer con:', {
              participantesLength: participantes.length,
              activeTab,
              participantesExternosLength: participantesExternos.length,
              participantesInternosLength: participantesInternos.length,
              participantesFriendFamilyLength: participantesFriendFamily.length
            });
            return null;
          })()}
          {/* Contenedor unificado con soporte para seguimientos */}
          <ParticipantesUnifiedContainer
              participantes={participantes}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={
                (() => {
                  const selectedFilters = activeTab === 'externos' ? filtersExternos :
                    activeTab === 'internos' ? filtersInternos :
                    activeTab === 'friend_family' ? filtersFriendFamily :
                    filters;
                  
                  console.log('🔍 Filtros seleccionados para ParticipantesUnifiedContainer:', {
                    activeTab,
                    selectedFilters,
                    estado_participante: selectedFilters.estado_participante
                  });
                  
                  return selectedFilters;
                })()
              }
              setFilters={handleFiltersChange}
              showFilterDrawer={showFilterDrawer}
              setShowFilterDrawer={setShowFilterDrawer}
              getActiveFiltersCount={getActiveFiltersCount}
              columns={
                activeTab === 'externos' ? columnsExternos :
                activeTab === 'internos' ? columnsInternos :
                activeTab === 'friend_family' ? columnsFriendFamily :
                columnsExternos // fallback
              }
              // Log para verificar las columnas
              {...(() => {
                const selectedColumns = activeTab === 'externos' ? columnsExternos :
                  activeTab === 'internos' ? columnsInternos :
                  activeTab === 'friend_family' ? columnsFriendFamily :
                  columnsExternos;
                console.log('🔍 Columnas seleccionadas:', {
                  activeTab,
                  columnsLength: selectedColumns.length,
                  firstColumn: selectedColumns[0]
                });
                return {};
              })()}
              onRowClick={handleVerParticipante}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={[
                {
                  value: 'externos',
                  label: 'Externos',
                  count: participantesExternos.length
                },
                {
                  value: 'internos',
                  label: 'Internos',
                  count: participantesInternos.length
                },
                {
                  value: 'friend_family',
                  label: 'Friend & Family',
                  count: participantesFriendFamily.length
                },
                {
                  value: 'seguimientos',
                  label: 'Seguimientos',
                  count: seguimientos.length
                }
              ]}
            filterOptions={{
              estados: estadosParticipante,
              roles: rolesEmpresa,
              empresas: empresas,
              departamentos: departamentos,
              responsables: responsables,
              investigaciones: investigaciones,
              participantes: participantesFiltros,
            }}
            // Log para verificar las opciones de filtro
            {...(() => {
              console.log('🔍 Opciones de filtro pasadas al FilterDrawer:', {
                estados: estadosParticipante,
                roles: rolesEmpresa,
                empresas: empresas,
                departamentos: departamentos,
              });
              return {};
            })()}
            onSelectionChange={handleSelectionChange}
            bulkActions={bulkActions}
            actions={(() => {
              const baseActions = [
                {
                  label: 'Ver Detalles',
                  icon: <EyeIcon className="w-4 h-4" />,
                  onClick: (row: any) => handleVerParticipante(row)
                },
                {
                  label: 'Editar',
                  icon: <EditIcon className="w-4 h-4" />,
                  onClick: (row: any) => handleEditarParticipante(row)
                },
                {
                  label: 'Crear Dolor',
                  icon: <AlertTriangleIcon className="w-4 h-4" />,
                  onClick: (row: any) => handleCrearDolor(row)
                },
                {
                  label: 'Crear Perfilamiento',
                  icon: <MessageIcon className="w-4 h-4" />,
                  onClick: (row: any) => handleCrearPerfilamiento(row),
                  className: 'text-popover-foreground hover:text-popover-foreground/80'
                }
              ];

              // Agregar "Crear Seguimiento" solo para participantes externos
              if (activeTab === 'externos') {
                baseActions.push({
                  label: 'Crear Seguimiento',
                  icon: <ClipboardListIcon className="w-4 h-4" />,
                  onClick: (row: any) => handleCrearSeguimiento(row)
                });
              }

              baseActions.push({
                label: 'Eliminar',
                icon: <TrashIcon className="w-4 h-4" />,
                onClick: (row: any) => handleEliminarParticipante(row),
                className: 'text-red-600 hover:text-red-700'
              });

              return baseActions;
            })()}
            showCrearSeguimientoModal={showCrearSeguimientoModal}
            onCloseCrearSeguimientoModal={() => setShowCrearSeguimientoModal(false)}
            seguimientos={seguimientos}
            seguimientosLoading={seguimientosLoading}
            onRefreshSeguimientos={cargarSeguimientos}
            />



          {/* Modales para crear participantes */}
          {console.log('🔍 Renderizando modal externo, isOpen:', showModalExterno)}
          <CrearParticipanteExternoModal
            isOpen={showModalExterno}
            onClose={() => setShowModalExterno(false)}
            onSuccess={handleParticipanteCreado}
          />

          {console.log('🔍 Renderizando modal interno, isOpen:', showModalInterno)}
          <CrearParticipanteInternoModal
            isOpen={showModalInterno}
            onClose={() => setShowModalInterno(false)}
            onSuccess={handleParticipanteCreado}
          />

          {console.log('🔍 Renderizando modal friend family, isOpen:', showModalFriendFamily)}
          <CrearParticipanteFriendFamilyModal
            isOpen={showModalFriendFamily}
            onClose={() => setShowModalFriendFamily(false)}
            onSuccess={handleParticipanteCreado}
          />

          <EditarParticipanteModal
            isOpen={showModalEditar}
            onClose={() => {
              setShowModalEditar(false);
              setParticipanteParaEditar(null);
            }}
            onSuccess={handleParticipanteCreado}
            participante={participanteParaEditar}
          />

          {/* Modal de confirmación de eliminación */}
          <ConfirmModal
            isOpen={showModalEliminar}
            onClose={() => {
              setShowModalEliminar(false);
              setParticipanteParaEliminar(null);
            }}
            onConfirm={confirmarEliminacion}
            title="Eliminar Participante"
            message={`¿Estás seguro de que deseas eliminar el participante "${participanteParaEliminar?.nombre}"? Esta acción no se puede deshacer.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            type="error"
            loading={eliminandoParticipante}
          />

          {/* Modal de error de eliminación */}
          <ErrorEliminacionModal
            isOpen={showModalErrorEliminar}
            onClose={() => {
              setShowModalErrorEliminar(false);
              setParticipanteParaEliminar(null);
              setErrorEliminacion(null);
            }}
            participante={participanteParaEliminar}
            error={errorEliminacion}
          />

          {/* Modal de crear dolor */}
          <DolorSideModal
            isOpen={showModalCrearDolor}
            onClose={() => {
              setShowModalCrearDolor(false);
              setParticipanteParaCrearDolor(null);
            }}
            participanteId={participanteParaCrearDolor?.id || ''}
            participanteNombre={participanteParaCrearDolor?.nombre || ''}
            onSave={handleDolorGuardado}
          />

          {/* Modal de perfilamiento */}
          <SeleccionarCategoriaPerfilamientoModal
            isOpen={showModalPerfilamiento}
            onClose={() => {
              setShowModalPerfilamiento(false);
              setParticipanteParaPerfilamiento(null);
            }}
            participanteId={participanteParaPerfilamiento?.id || ''}
            participanteNombre={participanteParaPerfilamiento?.nombre || ''}
            onCategoriaSeleccionada={(categoria) => {
              // Guardar la categoría seleccionada y abrir modal de creación
              console.log('🔍 Categoría seleccionada:', categoria);
              console.log('🔍 Participante temporal:', participantePerfilamientoTemp);
              setCategoriaSeleccionada(categoria);
              setShowModalCrearPerfilamiento(true);
              // Cerrar el modal de categoría para mostrar el de creación
              setShowModalPerfilamiento(false);
            }}
          />

          {/* Modal de crear perfilamiento específico */}
          {showModalCrearPerfilamiento && categoriaSeleccionada && participantePerfilamientoTemp && (
            <CrearPerfilamientoModal
              isOpen={true}
              onClose={() => {
                // Si se cancela, limpiar todo
                setShowModalCrearPerfilamiento(false);
                setCategoriaSeleccionada(null);
                setParticipantePerfilamientoTemp(null);
              }}
              participanteId={participantePerfilamientoTemp.id}
              participanteNombre={participantePerfilamientoTemp.nombre}
              categoria={categoriaSeleccionada}
              onBack={() => {
                // Volver al modal de selección de categoría
                setShowModalCrearPerfilamiento(false);
                setCategoriaSeleccionada(null);
                setShowModalPerfilamiento(true);
              }}
              onSuccess={() => {
                // Si se crea exitosamente, limpiar todo
                setShowModalCrearPerfilamiento(false);
                setCategoriaSeleccionada(null);
                setParticipantePerfilamientoTemp(null);
                showSuccess('Perfilamiento creado exitosamente');
              }}
            />
          )}

          {/* Modal para crear seguimiento desde participante */}
          {showCrearSeguimientoModal && participanteParaSeguimiento && (
            <SeguimientoSideModal
              isOpen={showCrearSeguimientoModal}
              onClose={() => {
                setShowCrearSeguimientoModal(false);
                setParticipanteParaSeguimiento(null);
              }}
              onSave={async (seguimientoData) => {
                try {
                  console.log('🔍 [Crear Seguimiento] Datos recibidos:', seguimientoData);
                  console.log('🔍 [Crear Seguimiento] Participante:', participanteParaSeguimiento);
                  
                  const requestData = {
                    ...seguimientoData,
                    participante_externo_id: participanteParaSeguimiento.id
                  };
                  
                  console.log('🔍 [Crear Seguimiento] Datos a enviar:', requestData);
                  
                  const response = await fetch('/api/seguimientos', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                  });

                  console.log('🔍 [Crear Seguimiento] Response status:', response.status);
                  
                  if (response.ok) {
                    const result = await response.json();
                    console.log('🔍 [Crear Seguimiento] Seguimiento creado:', result);
                    showSuccess('Seguimiento creado exitosamente');
                    setShowCrearSeguimientoModal(false);
                    setParticipanteParaSeguimiento(null);
                    cargarSeguimientos();
                  } else {
                    const errorData = await response.json();
                    console.error('🔍 [Crear Seguimiento] Error response:', errorData);
                    showError(errorData.message || 'Error al crear el seguimiento');
                  }
                } catch (error) {
                  console.error('🔍 [Crear Seguimiento] Error catch:', error);
                  showError('Error al crear el seguimiento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                }
              }}
              investigacionId=""
              usuarios={usuarios}
              investigaciones={investigacionesModal}
              responsablePorDefecto={userId}
              participanteExternoPrecargado={{
                id: participanteParaSeguimiento.id,
                nombre: participanteParaSeguimiento.nombre,
                email: participanteParaSeguimiento.email,
                empresa_nombre: participanteParaSeguimiento.empresa_nombre
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
} 