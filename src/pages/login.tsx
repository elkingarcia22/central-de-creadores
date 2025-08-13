import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useRol } from '../contexts/RolContext'
import SelectorRolModal from '../components/SelectorRolModal'
import { supabase } from '../api/supabase' // Asegúrate que la ruta sea correcta
import { UserIcon, PasswordIcon, EyeIcon, EyeOffIcon } from '../components/icons'
import { useTheme } from '../contexts/ThemeContext'
import { Button, Input, Typography, Card } from '../components/ui'

// Configuración de menús por rol (igual que en DashboardLayout)
const menuConfig = {
  administrador: [
    { label: 'Investigaciones', href: '/investigaciones' },
    { label: 'Reclutamiento', href: '/reclutamiento' },
    { label: 'Sesiones', href: '/sesiones' },
    { label: 'Métricas', href: '/metricas' },
    { label: 'Participantes', href: '/participantes' },
    { label: 'Empresas', href: '/empresas' },
    { label: 'Configuraciones', href: '/configuraciones' },
    { label: 'Conocimiento', href: '/conocimiento' },
  ],
  investigador: [
    { label: 'Investigaciones', href: '/investigaciones' },
    { label: 'Sesiones', href: '/sesiones' },
    { label: 'Métricas', href: '/metricas' },
    { label: 'Participantes', href: '/participantes' },
    { label: 'Empresas', href: '/empresas' },
    { label: 'Conocimiento', href: '/conocimiento' },
  ],
  reclutador: [
    { label: 'Reclutamiento', href: '/reclutamiento' },
    { label: 'Participantes', href: '/participantes' },
    { label: 'Empresas', href: '/empresas' },
    { label: 'Configuraciones', href: '/configuraciones' },
    { label: 'Conocimiento', href: '/conocimiento' },
  ],
};

export default function Login() {
  const router = useRouter()
  const { setRolSeleccionado, setRolesDisponibles } = useRol()
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roles, setRoles] = useState<{ id: string; nombre: string }[]>([])
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [hasCheckedSession, setHasCheckedSession] = useState(false)

  // Log cuando cambie el error
  useEffect(() => {
    if (error) {
      console.log('🔍 Estado de error actualizado:', error);
    }
  }, [error]);

  // Verificar si ya hay una sesión activa al cargar el componente
  useEffect(() => {
    const checkSession = async () => {
      // Evitar verificación múltiple
      if (hasCheckedSession) {
        return;
      }
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Error obteniendo sesión:', error);
          setHasCheckedSession(true);
          return;
        }
        
        if (session) {
          console.log('Sesión activa detectada');
          
          // Verificar que la sesión no haya expirado
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            console.log('Sesión expirada, limpiando');
            await supabase.auth.signOut();
            setHasCheckedSession(true);
            return;
          }
          
          // Verificar si ya hay un rol seleccionado válido
          const storedRol = localStorage.getItem('rolSeleccionado');
          if (storedRol) {
            try {
              const rol = JSON.parse(storedRol);
              console.log('Rol ya seleccionado:', rol);
              
              // Verificar que el rol sea válido (en minúsculas)
              const rolNormalizado = rol.toLowerCase();
              const opciones = menuConfig[rolNormalizado] || [];
              
              if (opciones.length > 0) {
                // Buscar el primer módulo real del menú (que no sea /dashboard ni /dashboard/[rol])
                let destino = opciones.find(op => !op.href.startsWith('/dashboard'))?.href || opciones[0]?.href || '/';
                console.log('Redirigiendo a módulo:', destino);
                setHasCheckedSession(true);
                router.replace(destino);
              } else {
                console.log('Rol no válido, limpiando localStorage');
                localStorage.removeItem('rolSeleccionado');
                localStorage.removeItem('rolesDisponibles');
                setHasCheckedSession(true);
                // No redirigir, dejar que el usuario haga login
              }
            } catch (e) {
              console.error('Error parsing stored role:', e);
              localStorage.removeItem('rolSeleccionado');
              localStorage.removeItem('rolesDisponibles');
              setHasCheckedSession(true);
            }
          } else {
            console.log('No hay rol seleccionado, mostrar formulario de login');
            setHasCheckedSession(true);
            // No redirigir, mostrar el formulario de login
          }
        } else {
          console.log('No hay sesión activa');
          setHasCheckedSession(true);
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setHasCheckedSession(true);
      }
    };
    
    checkSession();
  }, [router, hasCheckedSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Intentando login con:', { email, password: password ? '***' : 'vacío' });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Error de autenticación:', error);
        console.log('🔍 Estableciendo error en estado:', error.message);
        setError(error.message);
        return;
      }

      if (data.user) {
        // Cargar roles del usuario después del login exitoso
        try {
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select(`
              role,
              roles_plataforma: role (
                id,
                nombre
              )
            `)
            .eq('user_id', data.user.id);

          if (rolesError) {
            console.error('Error cargando roles:', rolesError);
            setError('Error cargando roles del usuario');
            return;
          }

          const rolesProcesados = (rolesData || [])
            .map((ur: any) => ({
              id: ur.roles_plataforma?.id || ur.role,
              nombre: ur.roles_plataforma?.nombre || ur.role
            }))
            .filter((rol: any) => rol.nombre && rol.nombre !== 'usuario');

          console.log('Roles cargados:', rolesProcesados);

          if (rolesProcesados.length === 0) {
            setError('No tienes roles asignados. Contacta al administrador.');
            return;
          }

          if (rolesProcesados.length === 1) {
            // Si solo hay un rol, seleccionarlo automáticamente
            handleRolSeleccionado(rolesProcesados[0]);
          } else {
            // Si hay múltiples roles, mostrar el modal de selección
            setRoles(rolesProcesados);
            setRolesDisponibles(rolesProcesados.map(rol => rol.nombre));
            setShowRoleModal(true);
          }
        } catch (err) {
          console.error('Error procesando roles:', err);
          setError('Error procesando roles del usuario');
        }
      }
    } catch (err) {
      setError('Error inesperado durante el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  function getRolePath(roleId: string): string {
    if (roleId === 'bcc17f6a-d751-4c39-a479-412abddde0fa') {
      return 'administrador'
    } else if (roleId === 'e1fb53e3-3d1c-4ff5-bdac-9a1285dd99d7') {
      return 'investigador'
    } else if (roleId === 'fcf6ffc7-e8d3-407b-8c72-b4a7e8db6c9c') {
      return 'reclutador'
    } else if (roleId === '7e329b4c-3716-4781-919e-54106b51ca99') {
      return 'agendador'
    } else {
      return 'usuario'
    }
  }

  // Función para obtener el módulo principal de cada rol
  function getMainModuleForRole(roleName: string): string {
    const rolNormalizado = roleName.toLowerCase();
    switch (rolNormalizado) {
      case 'administrador':
        return '/investigaciones'; // Módulo principal para administrador
      case 'investigador':
        return '/investigaciones'; // Módulo principal para investigador
      case 'reclutador':
        return '/reclutamiento'; // Módulo principal para reclutador
      case 'agendador':
        return '/reclutamiento'; // Módulo principal para agendador
      default:
        return `/dashboard/${rolNormalizado}`; // Fallback al dashboard específico
    }
  }

  const handleModalClose = () => {
    setShowRoleModal(false)
    if (!loginSuccess) {
      setRoles([])
      setRolesDisponibles([])
    }
  }

  // Redirigir directamente al seleccionar un rol en el modal
  const handleRolSeleccionado = async (rol: { id: string; nombre: string }) => {
    console.log('Rol seleccionado:', rol.nombre);
    const rolNormalizado = rol.nombre.toLowerCase();
    setRolSeleccionado(rolNormalizado);
    localStorage.setItem('rolSeleccionado', JSON.stringify(rolNormalizado));
    setShowRoleModal(false);
    setLoginSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Redirigir al módulo principal del rol seleccionado
    const mainModule = getMainModuleForRole(rol.nombre);
    console.log('Redirigiendo al módulo principal:', mainModule);
    router.replace(mainModule);
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
                        <Typography variant="h2" color="title" weight="bold" className="mb-2 w-full text-center whitespace-nowrap sm:whitespace-normal">
            Central de Creadores
          </Typography>
          <Typography variant="subtitle1" color="secondary" className="w-full text-center whitespace-normal break-words">
            Inicia sesión en tu cuenta
          </Typography>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive-hover text-destructive">
                <Typography variant="body2">
                  {error}
                </Typography>
              </div>
            )}

            <Input
              type="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<UserIcon />}
              fullWidth
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<PasswordIcon />}
              iconPosition="left"
              fullWidth
              endAdornment={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="focus:outline-none px-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
              disabled={!email || !password}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Modal de selección de roles */}
      <SelectorRolModal
        isOpen={showRoleModal}
        onClose={handleModalClose}
        roles={roles}
      />

      {/* Overlay de carga cuando se está redirigiendo */}
      {loginSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <Typography variant="body1" color="primary">
              Redirigiendo al dashboard...
            </Typography>
          </Card>
        </div>
      )}
    </div>
  )
}