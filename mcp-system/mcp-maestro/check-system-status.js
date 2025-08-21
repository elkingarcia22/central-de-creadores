#!/usr/bin/env node

import { GitHubIntegration } from './tools/github-integration.js';
import { MCPSyncManager } from './tools/mcp-sync-manager.js';
import { AutoInitializer } from './scripts/auto-init.js';

async function checkSystemStatus() {
  console.log('🎯 Verificando estado completo del sistema MCP Maestro...\n');
  
  try {
    // 1. Verificar inicialización
    console.log('📋 1. Verificando inicialización...');
    const initializer = new AutoInitializer();
    const initStatus = await initializer.checkStatus();
    console.log('✅ Inicialización:', initStatus.initialized ? 'COMPLETA' : 'PENDIENTE');
    
    // 2. Verificar GitHub
    console.log('\n🔗 2. Verificando integración con GitHub...');
    const github = new GitHubIntegration('.');
    const githubStatus = await github.getIntegrationStatus();
    console.log('✅ GitHub:', githubStatus.active ? 'ACTIVO' : 'INACTIVO');
    if (githubStatus.active) {
      console.log('   - Repositorio:', githubStatus.repo_info.repo_name);
      console.log('   - Branch:', githubStatus.repo_info.current_branch);
      console.log('   - Estado:', githubStatus.repo_status.status_summary);
    }
    
    // 3. Verificar MCPs
    console.log('\n🔄 3. Verificando MCPs especializados...');
    const syncManager = new MCPSyncManager('.');
    const mcpStatus = syncManager.getSyncStatus();
    
    for (const [mcpName, mcpData] of Object.entries(mcpStatus)) {
      console.log(`   - ${mcpData.name}: ${mcpData.status.toUpperCase()}`);
    }
    
    // 4. Resumen general
    console.log('\n📊 RESUMEN DEL SISTEMA:');
    console.log('='.repeat(50));
    console.log(`✅ MCP Maestro: ${initStatus.initialized ? 'ACTIVO' : 'INACTIVO'}`);
    console.log(`🔗 GitHub: ${githubStatus.active ? 'CONECTADO' : 'DESCONECTADO'}`);
    console.log(`🔄 MCPs Sincronizados: ${Object.values(mcpStatus).filter(m => m.status === 'synced').length}/${Object.keys(mcpStatus).length}`);
    
    if (githubStatus.active && githubStatus.repo_status.has_unpushed_commits) {
      console.log(`⚠️  Commits pendientes: ${githubStatus.repo_status.unpushed_commits_count}`);
    }
    
    console.log('\n🎯 Sistema listo para orquestar tareas complejas!');
    
  } catch (error) {
    console.error('❌ Error verificando estado del sistema:', error);
  }
}

checkSystemStatus();
