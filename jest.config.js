module.exports = {
  // Entorno de testing
  testEnvironment: 'node',
  
  // Directorios de test
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Cobertura de código
  collectCoverage: true,
  collectCoverageFrom: [
    'central-de-creadores-mcp.js',
    'src/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**'
  ],
  
  // Reportes de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Setup de tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Timeout de tests
  testTimeout: 10000,
  
  // Variables de entorno para tests
  setupFiles: ['<rootDir>/jest.env.js'],
  
  // Transformaciones
  transform: {},
  
  // Extensiones de archivos
  moduleFileExtensions: ['js', 'json'],
  
  // Módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Configuración de verbose
  verbose: true,
  
  // Configuración de watch
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // Configuración de notificaciones
  notify: true,
  notifyMode: 'change'
}; 