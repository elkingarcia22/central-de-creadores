export default {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'prettier', 'plugin:storybook/recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    // Reglas de estilo
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Reglas de variables
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-undef': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    
    // Reglas de funciones
    'no-empty-function': 'warn',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    
    // Reglas de objetos
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', { 'object': true, 'array': false }],
    
    // Reglas de strings
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    
    // Reglas de control de flujo
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    
    // Reglas de promesas
    'prefer-promise-reject-errors': 'error',
    
    // Reglas de seguridad
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Reglas de MCP específicas
    'camelcase': ['error', { 'properties': 'never' }],
    'max-len': ['warn', { 'code': 120, 'ignoreUrls': true }],
    'comma-dangle': ['error', 'always-multiline'],
  },
  globals: {
    // Variables globales de Node.js
    'process': 'readonly',
    'Buffer': 'readonly',
    '__dirname': 'readonly',
    '__filename': 'readonly',
    
    // Variables globales de MCP
    'Server': 'readonly',
    'StdioServerTransport': 'readonly',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.min.js',
    'coverage/',
    '.next/',
  ],
}; 