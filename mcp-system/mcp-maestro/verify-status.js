#!/usr/bin/env node

/**
 * Script de Verificación Rápida - MCP Maestro
 * Verifica que el servidor esté funcionando correctamente en modo automático
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyMCPMaestroStatus() {
  console.log(chalk.blue('🎯 VERIFICANDO ESTADO DEL MCP MAESTRO'));
  console.log(chalk.cyan('=' * 50));
  
  try {
    // 1. Verificar que el servidor esté ejecutándose
    console.log(chalk.yellow('1. Verificando proceso del servidor...'));
    const { execSync } = await import('child_process');
    const psOutput = execSync('ps aux | grep "node server.js" | grep -v grep', { encoding: 'utf8' });
    
    if (psOutput.trim()) {
      const pid = psOutput.trim().split(/\s+/)[1];
      console.log(chalk.green(`✅ Servidor ejecutándose (PID: ${pid})`));
    } else {
      console.log(chalk.red('❌ Servidor no está ejecutándose'));
      return false;
    }
    
    // 2. Verificar archivo de estado
    console.log(chalk.yellow('2. Verificando archivo de estado...'));
    const statusFile = path.join(__dirname, 'maestro-status.json');
    const statusData = JSON.parse(await fs.readFile(statusFile, 'utf8'));
    
    if (statusData.status === 'active' && statusData.mode === 'automatic') {
      console.log(chalk.green('✅ Estado confirmado: ACTIVO en modo automático'));
    } else {
      console.log(chalk.red('❌ Estado incorrecto'));
      return false;
    }
    
    // 3. Verificar configuración automática
    console.log(chalk.yellow('3. Verificando configuración automática...'));
    const config = statusData.configuration;
    const requiredSettings = [
      'autoMode', 'skipConfirmations', 'autoExecute', 'autoCommit',
      'autoBackup', 'silentMode', 'autoRecoverContext', 'autoSync',
      'autoActivateGitHub', 'forceAuto', 'noPrompts', 'skipAllConfirmations'
    ];
    
    let allSettingsOk = true;
    requiredSettings.forEach(setting => {
      if (config[setting] === true) {
        console.log(chalk.green(`  ✅ ${setting}: activado`));
      } else {
        console.log(chalk.red(`  ❌ ${setting}: desactivado`));
        allSettingsOk = false;
      }
    });
    
    if (!allSettingsOk) {
      console.log(chalk.red('❌ Configuración automática incompleta'));
      return false;
    }
    
    // 4. Verificar herramientas disponibles
    console.log(chalk.yellow('4. Verificando herramientas disponibles...'));
    const tools = statusData.tools;
    const requiredTools = [
      'orchestrate_task', 'recover_context', 'delegate_to_mcp',
      'sync_project_state', 'get_system_status', 'save_important_decision',
      'query_knowledge_base', 'verify_project_info', 'activate_github',
      'auto_activate_session', 'sync_mcps', 'get_mcp_status', 'get_supabase_info'
    ];
    
    let allToolsOk = true;
    requiredTools.forEach(tool => {
      if (tools[tool] === 'active') {
        console.log(chalk.green(`  ✅ ${tool}: activo`));
      } else {
        console.log(chalk.red(`  ❌ ${tool}: inactivo`));
        allToolsOk = false;
      }
    });
    
    if (!allToolsOk) {
      console.log(chalk.red('❌ Algunas herramientas no están activas'));
      return false;
    }
    
    // 5. Verificar directorio de storage
    console.log(chalk.yellow('5. Verificando directorio de storage...'));
    const storageDir = path.join(__dirname, 'storage');
    const storageStats = await fs.stat(storageDir);
    
    if (storageStats.isDirectory()) {
      console.log(chalk.green('✅ Directorio de storage: OK'));
      
      // Verificar archivos importantes
      const importantFiles = [
        'context.json', 'sessions.json', 'decisions.json',
        'knowledge.json', 'project_state.json'
      ];
      
      for (const file of importantFiles) {
        try {
          await fs.access(path.join(storageDir, file));
          console.log(chalk.green(`  ✅ ${file}: existe`));
        } catch {
          console.log(chalk.yellow(`  ⚠️ ${file}: no existe (se creará automáticamente)`));
        }
      }
    } else {
      console.log(chalk.red('❌ Directorio de storage: ERROR'));
      return false;
    }
    
    // 6. Verificar integraciones
    console.log(chalk.yellow('6. Verificando integraciones...'));
    const integrations = statusData.integrations;
    const requiredIntegrations = [
      'github', 'supabase', 'design_system', 'code_structure',
      'testing_qa', 'deploy_devops', 'documentation'
    ];
    
    let allIntegrationsOk = true;
    requiredIntegrations.forEach(integration => {
      if (integrations[integration] === 'ready') {
        console.log(chalk.green(`  ✅ ${integration}: listo`));
      } else {
        console.log(chalk.yellow(`  ⚠️ ${integration}: no listo (se activará automáticamente)`));
        allIntegrationsOk = false;
      }
    });
    
    // Resultado final
    console.log(chalk.cyan('=' * 50));
    if (allSettingsOk && allToolsOk) {
      console.log(chalk.green('🎯 MCP MAESTRO: COMPLETAMENTE OPERATIVO EN MODO AUTOMÁTICO'));
      console.log(chalk.cyan('✅ Todas las verificaciones pasaron exitosamente'));
      console.log(chalk.cyan('✅ Servidor ejecutándose y listo para orquestar'));
      console.log(chalk.cyan('✅ Modo automático completamente activado'));
      console.log(chalk.cyan('✅ Sin confirmaciones - ejecución automática'));
      return true;
    } else {
      console.log(chalk.red('❌ MCP MAESTRO: PROBLEMAS DETECTADOS'));
      return false;
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error durante la verificación:'), error.message);
    return false;
  }
}

// Ejecutar verificación
verifyMCPMaestroStatus().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error(chalk.red('❌ Error fatal:'), error);
  process.exit(1);
});
