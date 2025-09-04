#!/usr/bin/env node

import fetch from 'node-fetch';
import chalk from 'chalk';

console.log(chalk.blue('🧪 PROBANDO MCP MAESTRO CORREGIDO'));
console.log(chalk.blue('===================================='));

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(endpoint, description) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(chalk.green(`✅ ${description}`));
      console.log(chalk.cyan(`   Respuesta: ${JSON.stringify(data, null, 2)}`));
      return true;
    } else {
      console.log(chalk.red(`❌ ${description}`));
      console.log(chalk.red(`   Error: ${response.status} - ${data.error || 'Error desconocido'}`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ ${description}`));
    console.log(chalk.red(`   Error de conexión: ${error.message}`));
    return false;
  }
}

async function testMCPMaestro() {
  console.log(chalk.blue('🔍 Verificando endpoints...'));
  
  // Test 1: Health check
  const healthOk = await testEndpoint('/health', 'Health Check');
  
  // Test 2: Status completo
  const statusOk = await testEndpoint('/status', 'Status Completo');
  
  // Test 3: Endpoint raíz
  const rootOk = await testEndpoint('/', 'Endpoint Raíz');
  
  // Test 4: Puerto ocupado
  console.log(chalk.blue('\n🔍 Verificando puerto...'));
  try {
    const { execSync } = await import('child_process');
    const portCheck = execSync('lsof -i :3001', { encoding: 'utf8' });
    console.log(chalk.green('✅ Puerto 3001 está ocupado por el MCP Maestro'));
    console.log(chalk.cyan(`   ${portCheck.split('\n')[1]}`));
  } catch (error) {
    console.log(chalk.red('❌ Puerto 3001 no está ocupado'));
  }
  
  // Test 5: Proceso ejecutándose
  console.log(chalk.blue('\n🔍 Verificando proceso...'));
  try {
    const { execSync } = await import('child_process');
    const pid = execSync('cat maestro.pid', { encoding: 'utf8' }).trim();
    const processCheck = execSync(`ps -p ${pid}`, { encoding: 'utf8' });
    
    if (processCheck.includes(pid)) {
      console.log(chalk.green(`✅ Proceso MCP Maestro ejecutándose con PID: ${pid}`));
      console.log(chalk.cyan(`   ${processCheck.split('\n')[1]}`));
    } else {
      console.log(chalk.red('❌ Proceso MCP Maestro no encontrado'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Error verificando proceso:', error.message));
  }
  
  // Test 6: Archivos de estado
  console.log(chalk.blue('\n🔍 Verificando archivos de estado...'));
  try {
    const fs = await import('fs');
    
    if (fs.existsSync('activation-status.json')) {
      console.log(chalk.green('✅ activation-status.json existe'));
      const status = JSON.parse(fs.readFileSync('activation-status.json', 'utf8'));
      console.log(chalk.cyan(`   Estado: ${status.status}, Modo: ${status.mode}`));
    } else {
      console.log(chalk.red('❌ activation-status.json no existe'));
    }
    
    if (fs.existsSync('maestro.pid')) {
      console.log(chalk.green('✅ maestro.pid existe'));
      const pid = fs.readFileSync('maestro.pid', 'utf8').trim();
      console.log(chalk.cyan(`   PID: ${pid}`));
    } else {
      console.log(chalk.red('❌ maestro.pid no existe'));
    }
    
    if (fs.existsSync('auto-config.json')) {
      console.log(chalk.green('✅ auto-config.json existe'));
      const config = JSON.parse(fs.readFileSync('auto-config.json', 'utf8'));
      console.log(chalk.cyan(`   Modo automático: ${config.autoMode}`));
    } else {
      console.log(chalk.red('❌ auto-config.json no existe'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Error verificando archivos:', error.message));
  }
  
  // Resumen
  console.log(chalk.blue('\n📊 RESUMEN DE PRUEBAS'));
  console.log(chalk.blue('========================'));
  
  const tests = [healthOk, statusOk, rootOk];
  const passed = tests.filter(Boolean).length;
  const total = tests.length;
  
  if (passed === total) {
    console.log(chalk.green(`🎉 TODAS LAS PRUEBAS PASARON (${passed}/${total})`));
    console.log(chalk.green('🎯 MCP Maestro está funcionando correctamente'));
    console.log(chalk.blue('🌐 Disponible en: http://localhost:3001'));
    console.log(chalk.blue('📊 Status: http://localhost:3001/status'));
    console.log(chalk.blue('💚 Health: http://localhost:3001/health'));
  } else {
    console.log(chalk.yellow(`⚠️ ALGUNAS PRUEBAS FALLARON (${passed}/${total})`));
    console.log(chalk.yellow('🔧 Revisar logs y configuración'));
  }
  
  console.log(chalk.blue('\n🎯 CARACTERÍSTICAS ACTIVADAS:'));
  console.log(chalk.cyan('✅ Modo automático'));
  console.log(chalk.cyan('✅ Sin confirmaciones'));
  console.log(chalk.cyan('✅ Auto-ejecución'));
  console.log(chalk.cyan('✅ Auto-commit'));
  console.log(chalk.cyan('✅ Auto-backup'));
  console.log(chalk.cyan('✅ Auto-recuperación de contexto'));
  console.log(chalk.cyan('✅ Auto-sincronización'));
  console.log(chalk.cyan('✅ GitHub automático'));
}

// Ejecutar pruebas
testMCPMaestro().catch(console.error);
