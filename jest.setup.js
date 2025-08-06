// ====================================
// SETUP DE JEST PARA MCP SERVER
// ====================================

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test-project.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Configurar console para tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Silenciar logs en tests por defecto
beforeAll(() => {
  if (process.env.VERBOSE_TESTS !== 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

// Restaurar console después de tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock de Supabase para tests
jest.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null }))
    }
  };
  
  return {
    createClient: jest.fn(() => mockSupabase)
  };
});

// Mock de fs para tests
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(() => Promise.resolve('mock file content')),
    writeFile: jest.fn(() => Promise.resolve()),
    mkdir: jest.fn(() => Promise.resolve()),
    access: jest.fn(() => Promise.resolve())
  }
}));

// Mock de child_process para tests
jest.mock('child_process', () => ({
  execSync: jest.fn(() => 'mock command output')
}));

// Configurar timeout global para tests
jest.setTimeout(10000);

// Helper para limpiar mocks entre tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Helper para crear datos de prueba
global.createTestData = {
  usuario: {
    id: 'test-user-id',
    nombre: 'Usuario Test',
    correo: 'test@example.com',
    activo: true
  },
  investigacion: {
    id: 'test-investigacion-id',
    nombre: 'Investigación Test',
    fecha_inicio: '2025-01-01',
    fecha_fin: '2025-01-31',
    estado: 'en_borrador'
  },
  participante: {
    id: 'test-participante-id',
    nombre: 'Participante Test',
    rol_empresa_id: 'test-rol-id',
    empresa_id: 'test-empresa-id'
  },
  reclutamiento: {
    id: 'test-reclutamiento-id',
    investigacion_id: 'test-investigacion-id',
    participantes_id: 'test-participante-id',
    fecha_asignado: '2025-01-01T00:00:00Z'
  }
};

// Helper para validar respuestas MCP
global.validateMCPResponse = (response) => {
  expect(response).toHaveProperty('content');
  expect(Array.isArray(response.content)).toBe(true);
  expect(response.content.length).toBeGreaterThan(0);
  
  const firstContent = response.content[0];
  expect(firstContent).toHaveProperty('type');
  expect(firstContent).toHaveProperty('text');
  expect(typeof firstContent.text).toBe('string');
  expect(firstContent.text.length).toBeGreaterThan(0);
};

// Helper para simular errores
global.simulateError = (message) => {
  throw new Error(message);
};

// Helper para esperar operaciones asíncronas
global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configurar matchers personalizados
expect.extend({
  toBeValidMCPResponse(received) {
    const pass = received && 
                 typeof received === 'object' && 
                 received.content && 
                 Array.isArray(received.content) &&
                 received.content.length > 0;
    
    if (pass) {
      return {
        message: () => `expected response to not be a valid MCP response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected response to be a valid MCP response`,
        pass: false,
      };
    }
  },
  
  toContainSQL(received, sqlKeyword) {
    const pass = received && 
                 typeof received === 'string' && 
                 received.toLowerCase().includes(sqlKeyword.toLowerCase());
    
    if (pass) {
      return {
        message: () => `expected response to not contain SQL keyword "${sqlKeyword}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected response to contain SQL keyword "${sqlKeyword}"`,
        pass: false,
      };
    }
  }
});

// Configurar tipos globales para TypeScript (si se usa)
if (typeof global !== 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
} 