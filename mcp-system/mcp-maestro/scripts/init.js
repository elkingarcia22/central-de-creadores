#!/usr/bin/env node

/**
 * Script de Inicialización del MCP Maestro
 * 
 * Este script configura el entorno inicial necesario para el MCP Maestro
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

async function initializeMCPMaestro() {
  console.log('🎯 Inicializando MCP Maestro...\n');

  try {
    // Crear directorios necesarios
    await createDirectories();
    
    // Inicializar archivos de storage
    await initializeStorageFiles();
    
    // Crear archivos de configuración inicial
    await createInitialConfigs();
    
    // Verificar dependencias
    await verifyDependencies();
    
    console.log('✅ MCP Maestro inicializado correctamente!\n');
    console.log('📋 Próximos pasos:');
    console.log('1. cp env.example .env');
    console.log('2. Editar .env con tu configuración');
    console.log('3. npm run dev para iniciar en modo desarrollo');
    console.log('4. Verificar conectividad: curl http://localhost:3000/health');
    
  } catch (error) {
    console.error('❌ Error inicializando MCP Maestro:', error);
    process.exit(1);
  }
}

async function createDirectories() {
  console.log('📁 Creando directorios...');
  
  const directories = [
    'storage',
    'storage/sessions',
    'storage/context',
    'storage/decisions',
    'storage/backups',
    'storage/logs',
    'knowledge',
    'knowledge/patterns',
    'knowledge/solutions',
    'knowledge/configurations',
    'tmp',
    'cache'
  ];

  for (const dir of directories) {
    const fullPath = path.join(projectRoot, dir);
    try {
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`  ✅ ${dir}`);
    } catch (error) {
      console.log(`  ⚠️  ${dir} (ya existe)`);
    }
  }
}

async function initializeStorageFiles() {
  console.log('\n💾 Inicializando archivos de storage...');
  
  const storageFiles = {
    'storage/sessions.json': {
      sessions: [],
      last_cleanup: new Date().toISOString(),
      active_count: 0
    },
    'storage/context.json': {
      contexts: [],
      total_contexts: 0,
      last_updated: new Date().toISOString()
    },
    'storage/decisions.json': {
      decisions: [],
      decision_count: 0,
      last_updated: new Date().toISOString()
    },
    'storage/project_state.json': {
      version: '1.0.0',
      environment: 'development',
      last_updated: new Date().toISOString(),
      features: {},
      configurations: {},
      dependencies: {},
      metrics: {}
    },
    'storage/impact_analysis.json': {
      analyses: [],
      trends: {},
      patterns: {}
    },
    'storage/knowledge.json': {
      decisions: [],
      patterns: [],
      solutions: [],
      configurations: []
    }
  };

  for (const [filePath, content] of Object.entries(storageFiles)) {
    const fullPath = path.join(projectRoot, filePath);
    try {
      await fs.access(fullPath);
      console.log(`  ⚠️  ${filePath} (ya existe)`);
    } catch {
      await fs.writeFile(fullPath, JSON.stringify(content, null, 2));
      console.log(`  ✅ ${filePath}`);
    }
  }
}

async function createInitialConfigs() {
  console.log('\n⚙️  Creando configuraciones iniciales...');
  
  // Crear configuración inicial de conocimiento
  const knowledgeFiles = {
    'knowledge/patterns/common-patterns.json': {
      patterns: [
        {
          id: 'modal-component',
          name: 'Componente Modal',
          description: 'Patrón para crear componentes modales reutilizables',
          tags: ['ui', 'modal', 'component'],
          mcps_involved: ['design-system', 'code-structure'],
          success_rate: 95,
          usage_count: 0
        },
        {
          id: 'database-table',
          name: 'Crear Tabla de Base de Datos',
          description: 'Patrón para crear tablas con RLS en Supabase',
          tags: ['database', 'supabase', 'table', 'rls'],
          mcps_involved: ['supabase'],
          success_rate: 90,
          usage_count: 0
        },
        {
          id: 'api-endpoint',
          name: 'Endpoint de API',
          description: 'Patrón para crear endpoints de API seguros',
          tags: ['api', 'backend', 'security'],
          mcps_involved: ['supabase', 'testing-qa'],
          success_rate: 88,
          usage_count: 0
        }
      ]
    },
    'knowledge/solutions/proven-solutions.json': {
      solutions: [
        {
          id: 'auth-integration',
          problem: 'Integración de autenticación con Supabase',
          solution: 'Usar RLS policies con JWT tokens',
          tags: ['auth', 'supabase', 'security'],
          success_rate: 92,
          last_used: null
        },
        {
          id: 'component-optimization',
          problem: 'Optimización de componentes React',
          solution: 'Usar React.memo y useMemo para prevenir re-renders',
          tags: ['react', 'performance', 'optimization'],
          success_rate: 85,
          last_used: null
        }
      ]
    },
    'knowledge/configurations/optimal-configs.json': {
      configurations: [
        {
          id: 'tailwind-setup',
          name: 'Configuración Tailwind CSS',
          description: 'Configuración óptima de Tailwind para el proyecto',
          config: {
            theme: {
              extend: {
                colors: {
                  primary: '#3B82F6',
                  secondary: '#8B5CF6'
                }
              }
            }
          },
          tags: ['css', 'tailwind', 'design'],
          success_rate: 98
        }
      ]
    }
  };

  for (const [filePath, content] of Object.entries(knowledgeFiles)) {
    const fullPath = path.join(projectRoot, filePath);
    try {
      await fs.access(fullPath);
      console.log(`  ⚠️  ${filePath} (ya existe)`);
    } catch {
      await fs.writeFile(fullPath, JSON.stringify(content, null, 2));
      console.log(`  ✅ ${filePath}`);
    }
  }
}

async function verifyDependencies() {
  console.log('\n🔍 Verificando dependencias...');
  
  try {
    // Verificar package.json
    const packagePath = path.join(projectRoot, 'package.json');
    await fs.access(packagePath);
    console.log('  ✅ package.json encontrado');
    
    // Verificar node_modules
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    try {
      await fs.access(nodeModulesPath);
      console.log('  ✅ node_modules encontrado');
    } catch {
      console.log('  ⚠️  node_modules no encontrado - ejecuta npm install');
    }
    
    // Verificar archivos principales
    const mainFiles = ['server.js', 'tools/context-manager.js', 'tools/mcp-dispatcher.js'];
    for (const file of mainFiles) {
      const filePath = path.join(projectRoot, file);
      await fs.access(filePath);
      console.log(`  ✅ ${file}`);
    }
    
  } catch (error) {
    console.log('  ❌ Error verificando dependencias:', error.message);
    throw error;
  }
}

// Función para mostrar ayuda
function showHelp() {
  console.log(`
🎯 MCP Maestro - Script de Inicialización

Uso: node scripts/init.js [opciones]

Opciones:
  --help, -h     Mostrar esta ayuda
  --force, -f    Forzar recreación de archivos existentes
  --dev          Configurar para entorno de desarrollo
  --prod         Configurar para entorno de producción

Ejemplos:
  node scripts/init.js              # Inicialización básica
  node scripts/init.js --force      # Forzar recreación
  node scripts/init.js --dev        # Configuración de desarrollo
  
🔗 Más información: README.md
  `);
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Ejecutar inicialización
initializeMCPMaestro();