#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.green('🚀 ACTIVANDO SISTEMA MCP COMPLETO'));
console.log(chalk.blue('===================================='));

// Función para activar MCP Maestro
async function activateMCPMaestro() {
  console.log(chalk.blue('🎯 Activando MCP Maestro...'));
  
  const maestroDir = path.join(__dirname, 'mcp-system', 'mcp-maestro');
  
  if (!fs.existsSync(maestroDir)) {
    console.log(chalk.red('❌ Directorio MCP Maestro no encontrado'));
    return false;
  }
  
  try {
    // Cambiar al directorio del MCP Maestro
    process.chdir(maestroDir);
    
    // Ejecutar script de activación automática
    const maestroProcess = spawn('node', ['activate-maestro-auto.js'], {
      stdio: 'inherit',
      cwd: maestroDir
    });
    
    // Esperar un momento para que se inicie
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar si se inició correctamente
    if (fs.existsSync('maestro.pid')) {
      const pid = fs.readFileSync('maestro.pid', 'utf8').trim();
      console.log(chalk.green(`✅ MCP Maestro activado con PID: ${pid}`));
      return true;
    } else {
      console.log(chalk.yellow('⚠️ MCP Maestro no se inició correctamente'));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Error activando MCP Maestro: ${error.message}`));
    return false;
  }
}

// Función para verificar estado del sistema
function checkSystemStatus() {
  console.log(chalk.blue('\n🔍 VERIFICANDO ESTADO DEL SISTEMA MCP...'));
  
  // Verificar MCP Maestro
  const maestroDir = path.join(__dirname, 'mcp-system', 'mcp-maestro');
  if (fs.existsSync(path.join(maestroDir, 'activation-status.json'))) {
    try {
      const status = JSON.parse(fs.readFileSync(path.join(maestroDir, 'activation-status.json'), 'utf8'));
      console.log(chalk.cyan(`📊 MCP Maestro: ${status.status}`));
      if (status.pid) {
        console.log(chalk.cyan(`🆔 PID: ${status.pid}`));
      }
    } catch (error) {
      console.log(chalk.red('❌ Error leyendo estado del MCP Maestro'));
    }
  }
  
  // Verificar servidor simple
  if (fs.existsSync('mcp-server-simple.js')) {
    console.log(chalk.cyan('✅ Servidor MCP Simple: Disponible'));
  } else {
    console.log(chalk.red('❌ Servidor MCP Simple: No encontrado'));
  }
  
  // Verificar configuración
  if (fs.existsSync('central-de-creadores-mcp-maestro.json')) {
    console.log(chalk.cyan('✅ Configuración MCP: Disponible'));
  } else {
    console.log(chalk.red('❌ Configuración MCP: No encontrada'));
  }
}

// Función principal
async function main() {
  console.log(chalk.blue('🚀 Iniciando activación del sistema MCP...'));
  
  // Activar MCP Maestro
  const maestroActivated = await activateMCPMaestro();
  
  // Verificar estado del sistema
  checkSystemStatus();
  
  if (maestroActivated) {
    console.log(chalk.green('\n🎉 SISTEMA MCP ACTIVADO EXITOSAMENTE'));
    console.log(chalk.blue('===================================='));
    console.log(chalk.cyan('✅ MCP Maestro: ACTIVO en modo automático'));
    console.log(chalk.cyan('✅ Servidor MCP Simple: Disponible'));
    console.log(chalk.cyan('✅ Configuración: Lista para Cursor'));
    console.log(chalk.blue('\n📋 PRÓXIMOS PASOS:'));
    console.log(chalk.yellow('1. Reinicia Cursor completamente'));
    console.log(chalk.yellow('2. Ve a Settings > MCP Servers'));
    console.log(chalk.yellow('3. Selecciona: central-de-creadores-mcp-maestro.json'));
    console.log(chalk.yellow('4. ¡Disfruta del MCP Maestro en modo automático!'));
  } else {
    console.log(chalk.red('\n❌ ERROR EN LA ACTIVACIÓN DEL SISTEMA MCP'));
    console.log(chalk.yellow('Revisa los logs anteriores para más detalles'));
  }
}

// Ejecutar función principal
main().catch(console.error);
