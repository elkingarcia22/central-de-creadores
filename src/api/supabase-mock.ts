// Mock temporal de Supabase para desarrollo sin credenciales
// SOLO PARA DESARROLLO - REEMPLAZAR CON SUPABASE REAL

const mockData = {
  investigaciones: [
    {
      id: '1',
      nombre: 'Investigación de Usabilidad - App Mobile',
      fecha_inicio: '2024-01-15',
      fecha_fin: '2024-02-15',
      producto_id: '1',
      tipo_investigacion_id: '1',
      estado: 'en_progreso',
      tipo_prueba: 'usabilidad',
      plataforma: 'mobile',
      tipo_sesion: 'virtual',
      responsable_id: '1',
      creado_el: '2024-01-10T10:00:00Z',
      producto_nombre: 'App Mobile Banking',
      tipo_investigacion_nombre: 'Usabilidad',
      responsable_nombre: 'Ana García'
    },
    {
      id: '2',
      nombre: 'Estudio de Mercado - Nuevas Funcionalidades',
      fecha_inicio: '2024-02-01',
      fecha_fin: '2024-03-01',
      producto_id: '2',
      tipo_investigacion_id: '2',
      estado: 'en_borrador',
      tipo_prueba: 'entrevista',
      plataforma: 'web',
      tipo_sesion: 'presencial',
      responsable_id: '2',
      creado_el: '2024-01-20T14:30:00Z',
      producto_nombre: 'Portal Web',
      tipo_investigacion_nombre: 'Entrevista',
      responsable_nombre: 'Carlos López'
    }
  ],
  usuarios: [
    {
      id: 'mock-user-1',
      email: 'usuario@demo.com',
      full_name: 'Usuario Demo',
      avatar_url: null
    },
    {
      id: 'mock-user-2',
      email: 'admin@demo.com',
      full_name: 'Admin Demo',
      avatar_url: null
    }
  ],
  profiles: [
    {
      id: 'mock-user-1',
      email: 'usuario@demo.com',
      full_name: 'Usuario Demo',
      avatar_url: null
    }
  ],
  user_roles: [
    {
      user_id: 'mock-user-1',
      role: 'investigador',
      roles_plataforma: { nombre: 'Investigador' }
    }
  ],
  productos: [
    { id: '1', nombre: 'App Mobile Banking', activo: true },
    { id: '2', nombre: 'Portal Web', activo: true }
  ],
  tipos_investigacion: [
    { id: '1', nombre: 'Usabilidad' },
    { id: '2', nombre: 'Entrevista' }
  ],
  periodo: [
    { 
      id: '1', 
      etiqueta: '2024-Q1', 
      ano: 2024, 
      trimestre: 'Q1',
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-03-31'
    },
    { 
      id: '2', 
      etiqueta: '2024-Q2', 
      ano: 2024, 
      trimestre: 'Q2',
      fecha_inicio: '2024-04-01',
      fecha_fin: '2024-06-30'
    }
  ]
};

// Usuario mock actual
let currentMockUser = {
  id: 'mock-user-1',
  email: 'usuario@demo.com',
  user_metadata: {
    full_name: 'Usuario Demo',
    avatar_url: null
  }
};

// Función para crear un query builder que permita encadenamiento
function createQueryBuilder(table: string, data: any[]) {
  let currentData = [...data];
  
  const builder = {
    order: (column: string, options?: any) => {
      console.log(`📊 Mock: ORDER BY ${column} ${options?.ascending === false ? 'DESC' : 'ASC'}`);
      
      // Simular ordenamiento (básico)
      currentData.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        
        if (options?.ascending === false) {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
      
      // Retornar el mismo builder para permitir encadenamiento
      return builder;
    },
    limit: (count: number) => {
      console.log(`🔢 Mock: LIMIT ${count}`);
      currentData = currentData.slice(0, count);
      return builder;
    },
    eq: (column: string, value: any) => {
      console.log(`🎯 Mock: WHERE ${column} = ${value}`);
      currentData = currentData.filter((item: any) => item[column] === value);
      return builder;
    },
    single: () => {
      console.log(`🎯 Mock: SINGLE FROM ${table}`);
      const singleItem = currentData[0] || null;
      return Promise.resolve({ 
        data: singleItem, 
        error: singleItem ? null : { message: 'No data found' }
      });
    }
  };
  
  // Hacer que el builder sea thenable (Promise-like)
  Object.defineProperty(builder, 'then', {
    value: (resolve: (value: any) => void) => {
      const result = { 
        data: currentData, 
        error: null 
      };
      resolve(result);
      return Promise.resolve(result);
    },
    configurable: true
  });
  
  return builder;
}

export const supabaseMock = {
  from: (table: string) => {
    console.log(`📋 Mock: Consultando tabla "${table}"`);
    
    return {
      select: (columns?: string) => {
        console.log(`🔍 Mock: SELECT ${columns || '*'} FROM ${table}`);
        
        const tableData = (mockData as any)[table] || [];
        return createQueryBuilder(table, tableData);
      },
      insert: (data: any) => {
        console.log(`➕ Mock: INSERT INTO ${table}`, data);
        
        return {
          select: (columns?: string) => ({
            single: () => {
              const newItem = {
                ...data[0],
                id: Date.now().toString(),
                creado_el: new Date().toISOString()
              };
              console.log(`✅ Mock: Registro creado`, newItem);
              
              return Promise.resolve({ 
                data: newItem, 
                error: null 
              });
            }
          })
        };
      },
      delete: () => {
        console.log(`🗑️ Mock: DELETE FROM ${table}`);
        
        return {
          eq: (column: string, value: any) => {
            console.log(`🎯 Mock: WHERE ${column} = ${value} (DELETE)`);
            return Promise.resolve({ 
              data: null, 
              error: null 
            });
          }
        };
      }
    };
  },
  auth: {
    getSession: () => {
      console.log(`🔐 Mock: getSession()`);
      return Promise.resolve({
        data: { 
          session: {
            user: currentMockUser,
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000, // 1 hora
            expires_in: 3600,
            token_type: 'bearer'
          }
        },
        error: null
      });
    },
    getUser: () => {
      console.log(`👤 Mock: getUser()`);
      return Promise.resolve({
        data: { 
          user: currentMockUser
        },
        error: null
      });
    },
    signOut: () => {
      console.log(`🚪 Mock: signOut()`);
      return Promise.resolve({
        error: null
      });
    },
    signInWithPassword: (credentials: { email: string; password: string }) => {
      console.log(`🔑 Mock: signInWithPassword(${credentials.email})`);
      return Promise.resolve({
        data: {
          user: currentMockUser,
          session: {
            user: currentMockUser,
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000,
            expires_in: 3600,
            token_type: 'bearer'
          }
        },
        error: null
      });
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      console.log(`👂 Mock: onAuthStateChange()`);
      // Simular que hay una sesión activa
      setTimeout(() => {
        callback('SIGNED_IN', {
          user: currentMockUser,
          access_token: 'mock-access-token'
        });
      }, 100);
      
      // Retornar función de cleanup
      return {
        data: {
          subscription: {
            unsubscribe: () => console.log(`🔇 Mock: Unsubscribed from auth changes`)
          }
        }
      };
    }
  },
  // Métodos adicionales que podrían ser necesarios
  rpc: (functionName: string, params?: any) => {
    console.log(`⚡ Mock: RPC ${functionName}`, params);
    
    // Manejar funciones RPC específicas
    if (functionName === 'get_enum_values') {
      const enumName = params?.enum_name;
      
      if (enumName === 'estado_investigacion') {
        return Promise.resolve({
          data: ['en_borrador', 'por_iniciar', 'en_progreso', 'finalizado', 'pausado', 'cancelado'],
          error: null
        });
      }
      
      if (enumName === 'tipo_prueba') {
        return Promise.resolve({
          data: ['usabilidad', 'entrevista', 'encuesta', 'focus_group', 'card_sorting', 'tree_testing', 'a_b_testing'],
          error: null
        });
      }
      
      if (enumName === 'plataforma') {
        return Promise.resolve({
          data: ['web', 'mobile', 'desktop', 'tablet', 'smart_tv', 'wearable'],
          error: null
        });
      }
      
      if (enumName === 'tipo_sesion') {
        return Promise.resolve({
          data: ['presencial', 'virtual', 'hibrida'],
          error: null
        });
      }
    }
    
    // Función RPC no reconocida
    return Promise.resolve({
      data: null,
      error: { message: `Función RPC '${functionName}' no implementada en mock` }
    });
  }
};

// Función para verificar si se debe usar mock
export const shouldUseMock = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}; 