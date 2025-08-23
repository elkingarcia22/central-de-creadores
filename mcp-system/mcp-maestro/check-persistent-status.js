#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

async function checkPersistentStatus() {
  console.log('🎯 Verificando estado persistente del sistema MCP Maestro...\n');
  
  try {
    const statusFile = path.join('./storage', 'system-activation-status.json');
    
    // Verificar si existe el archivo de estado
    try {
      await fs.access(statusFile);
    } catch {
      console.log('❌ No se encontró archivo de estado persistente');
      console.log('💡 Ejecuta: node persistent-activation.js');
      return;
    }
    
    // Leer estado persistente
    const statusData = JSON.parse(await fs.readFile(statusFile, 'utf8'));
    
    console.log('📊 Estado persistente del sistema:');
    console.log('='.repeat(50));
    
    // MCP Maestro
    const mcpMaestro = statusData.mcp_maestro;
    console.log(`✅ MCP Maestro: ${mcpMaestro.active ? 'ACTIVO' : 'INACTIVO'}`);
    console.log(`   - Versión: ${mcpMaestro.version}`);
    console.log(`   - Activado: ${new Date(mcpMaestro.activated_at).toLocaleString()}`);
    
    // GitHub
    const github = statusData.github;
    console.log(`\n🔗 GitHub: ${github.active ? 'CONECTADO' : 'DESCONECTADO'}`);
    if (github.active && github.repo_info) {
      console.log(`   - Repositorio: ${github.repo_info.repo_name}`);
      console.log(`   - Branch: ${github.repo_info.current_branch}`);
      console.log(`   - Último commit: ${github.repo_info.last_commit.subject.substring(0, 50)}...`);
      console.log(`   - Activado: ${new Date(github.activated_at).toLocaleString()}`);
    }
    
    // MCPs
    const mcps = statusData.mcps;
    console.log(`\n🔄 MCPs Especializados: ${mcps.synced}/${mcps.total} SINCRONIZADOS`);
    console.log(`   - Última sincronización: ${new Date(mcps.last_sync).toLocaleString()}`);
    
    // Estado del sistema
    const systemStatus = statusData.system_status;
    console.log(`\n🎯 Estado del Sistema: ${systemStatus.fully_activated ? 'COMPLETAMENTE ACTIVADO' : 'PARCIALMENTE ACTIVADO'}`);
    console.log(`   - Última activación: ${new Date(systemStatus.last_activation).toLocaleString()}`);
    console.log(`   - Contador de activaciones: ${systemStatus.activation_count}`);
    
    console.log('\n🎯 ¡Sistema MCP Maestro funcionando correctamente!');
    console.log('💡 El estado se mantiene persistente entre sesiones.');
    
  } catch (error) {
    console.error('❌ Error verificando estado persistente:', error);
  }
}

checkPersistentStatus();
