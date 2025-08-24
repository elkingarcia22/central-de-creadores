#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🔍 Verificando MCP Maestro y posibles conflictos...'));

// Función para buscar MCPs maestros
function findMCPMaestros() {
  const mcpMaestros = [];
  
  // Buscar en mcp-system
  const mcpSystemPath = path.join(process.cwd(), 'mcp-system');
  if (fs.existsSync(mcpSystemPath)) {
    const items = fs.readdirSync(mcpSystemPath);
    
    items.forEach(item => {
      const itemPath = path.join(mcpSystemPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory() && item.toLowerCase().includes('maestro')) {
        mcpMaestros.push({
          path: itemPath,
          name: item,
          type: 'directory'
        });
      }
    });
  }
  
  // Buscar archivos con "maestro" en el nombre
  const rootPath = process.cwd();
  const searchForMaestroFiles = (dir) => {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        
        try {
          const stats = fs.statSync(itemPath);
          
          if (stats.isFile() && item.toLowerCase().includes('maestro')) {
            mcpMaestros.push({
              path: itemPath,
              name: item,
              type: 'file'
            });
          } else if (stats.isDirectory() && !item.startsWith('.') && !item.includes('node_modules')) {
            searchForMaestroFiles(itemPath);
          }
        } catch (error) {
          // Ignorar errores de permisos
        }
      });
    } catch (error) {
      // Ignorar errores de permisos
    }
  };
  
  searchForMaestroFiles(rootPath);
  
  return mcpMaestros;
}

// Función para verificar el MCP Maestro principal
function verifyMainMCPMaestro() {
  const mainPath = path.join(process.cwd(), 'mcp-system', 'mcp-maestro');
  
  if (!fs.existsSync(mainPath)) {
    return { exists: false, error: 'MCP Maestro principal no encontrado' };
  }
  
  const serverPath = path.join(mainPath, 'server.js');
  const packagePath = path.join(mainPath, 'package.json');
  
  const checks = {
    directory: fs.existsSync(mainPath),
    server: fs.existsSync(serverPath),
    package: fs.existsSync(packagePath),
    autoConfig: fs.existsSync(path.join(process.cwd(), 'mcp-system', 'auto-config.json'))
  };
  
  return {
    exists: true,
    path: mainPath,
    checks,
    allGood: Object.values(checks).every(check => check)
  };
}

// Función para verificar configuración automática
function verifyAutoConfig() {
  const configPath = path.join(process.cwd(), 'mcp-system', 'auto-config.json');
  
  if (!fs.existsSync(configPath)) {
    return { exists: false, error: 'Configuración automática no encontrada' };
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return {
      exists: true,
      config,
      autoMode: config.mcpMaestro?.autoMode || false,
      skipConfirmations: config.mcpMaestro?.skipConfirmations || false
    };
  } catch (error) {
    return { exists: false, error: 'Error leyendo configuración automática' };
  }
}

// Ejecutar verificaciones
console.log(chalk.blue('\n📋 Verificando MCPs Maestros encontrados...'));
const mcpMaestros = findMCPMaestros();

if (mcpMaestros.length === 0) {
  console.log(chalk.yellow('⚠️ No se encontraron MCPs Maestros'));
} else {
  console.log(chalk.cyan(`📁 Se encontraron ${mcpMaestros.length} elementos relacionados con MCP Maestro:`));
  
  mcpMaestros.forEach((mcp, index) => {
    const relativePath = path.relative(process.cwd(), mcp.path);
    console.log(chalk.yellow(`  ${index + 1}. ${mcp.name} (${mcp.type}) - ${relativePath}`));
  });
}

console.log(chalk.blue('\n🎯 Verificando MCP Maestro principal...'));
const mainMCP = verifyMainMCPMaestro();

if (mainMCP.exists) {
  console.log(chalk.green('✅ MCP Maestro principal encontrado'));
  console.log(chalk.cyan(`   📍 Ubicación: ${path.relative(process.cwd(), mainMCP.path)}`));
  
  console.log(chalk.blue('\n🔍 Verificando componentes:'));
  Object.entries(mainMCP.checks).forEach(([component, exists]) => {
    const status = exists ? '✅' : '❌';
    const color = exists ? chalk.green : chalk.red;
    console.log(color(`   ${status} ${component}`));
  });
  
  if (mainMCP.allGood) {
    console.log(chalk.green('\n🎉 MCP Maestro principal completamente configurado'));
  } else {
    console.log(chalk.red('\n⚠️ MCP Maestro principal incompleto'));
  }
} else {
  console.log(chalk.red(`❌ ${mainMCP.error}`));
}

console.log(chalk.blue('\n🤖 Verificando configuración automática...'));
const autoConfig = verifyAutoConfig();

if (autoConfig.exists) {
  console.log(chalk.green('✅ Configuración automática encontrada'));
  console.log(chalk.cyan(`   🤖 Modo automático: ${autoConfig.autoMode ? '✅ Activado' : '❌ Desactivado'}`));
  console.log(chalk.cyan(`   🚫 Sin confirmaciones: ${autoConfig.skipConfirmations ? '✅ Activado' : '❌ Desactivado'}`));
} else {
  console.log(chalk.red(`❌ ${autoConfig.error}`));
}

// Resumen final
console.log(chalk.blue('\n📊 RESUMEN DE VERIFICACIÓN:'));
console.log(chalk.cyan('================================'));

if (mcpMaestros.length === 1 && mainMCP.allGood && autoConfig.autoMode) {
  console.log(chalk.green('🎉 ESTADO PERFECTO:'));
  console.log(chalk.green('   ✅ Solo existe un MCP Maestro'));
  console.log(chalk.green('   ✅ MCP Maestro completamente configurado'));
  console.log(chalk.green('   ✅ Modo automático activado'));
  console.log(chalk.green('   ✅ Sin conflictos detectados'));
  
  console.log(chalk.blue('\n🚀 PROMPT RECOMENDADO:'));
  console.log(chalk.yellow('   "ACTIVA EL MCP MAESTRO EXISTENTE EN MODO AUTOMÁTICO"'));
  
} else if (mcpMaestros.length > 1) {
  console.log(chalk.red('⚠️ CONFLICTO DETECTADO:'));
  console.log(chalk.red(`   ❌ Se encontraron ${mcpMaestros.length} MCPs Maestros`));
  console.log(chalk.red('   ❌ Esto puede causar confusión'));
  
  console.log(chalk.blue('\n🔧 SOLUCIÓN:'));
  console.log(chalk.yellow('   Usar el prompt específico para activar el correcto'));
  
} else {
  console.log(chalk.yellow('⚠️ CONFIGURACIÓN INCOMPLETA:'));
  console.log(chalk.yellow('   ❌ MCP Maestro no está completamente configurado'));
  
  console.log(chalk.blue('\n🔧 SOLUCIÓN:'));
  console.log(chalk.yellow('   Ejecutar: node mcp-system/configure-auto-mode.js'));
}

console.log(chalk.blue('\n📋 COMANDOS ÚTILES:'));
console.log(chalk.yellow('   node mcp-system/test-auto-mode.js'));
console.log(chalk.yellow('   cat mcp-system/auto-config.json'));
console.log(chalk.yellow('   ls -la mcp-system/mcp-maestro/'));
