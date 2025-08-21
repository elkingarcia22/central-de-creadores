#!/usr/bin/env node

import { GitHubIntegration } from './tools/github-integration.js';
import { MCPSyncManager } from './tools/mcp-sync-manager.js';
import { AutoInitializer } from './scripts/auto-init.js';

async function activateSystem() {
  console.log('🚀 Activando sistema completo MCP Maestro...\n');
  
  try {
    // 1. Inicializar MCP Maestro
    console.log('📋 1. Inicializando MCP Maestro...');
    const initializer = new AutoInitializer();
    await initializer.initialize();
    console.log('✅ MCP Maestro inicializado');
    
    // 2. Activar GitHub
    console.log('\n🔗 2. Activando integración con GitHub...');
    const github = new GitHubIntegration('.');
    const githubResult = await github.activate(true);
    console.log('✅ GitHub activado:', githubResult.success ? 'EXITOSO' : 'FALLIDO');
    
    if (githubResult.success) {
      console.log('   - Repositorio:', githubResult.repo_info.repo_name);
      console.log('   - Branch:', githubResult.repo_info.current_branch);
      console.log('   - Estado:', githubResult.repo_status.status_summary);
    }
    
    // 3. Sincronizar MCPs
    console.log('\n🔄 3. Sincronizando MCPs especializados...');
    const syncManager = new MCPSyncManager('.');
    const syncResult = await syncManager.syncAllMCPs();
    
    let syncedCount = 0;
    for (const [mcpName, mcpData] of Object.entries(syncResult)) {
      if (mcpData.success) {
        console.log(`   ✅ ${mcpName}: SINCRONIZADO`);
        syncedCount++;
      } else {
        console.log(`   ❌ ${mcpName}: ERROR`);
      }
    }
    
    // 4. Verificar estado final
    console.log('\n📊 4. Verificando estado final...');
    const finalStatus = await github.getIntegrationStatus();
    
    // 5. Resumen de activación
    console.log('\n🎯 SISTEMA ACTIVADO EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log(`✅ MCP Maestro: ACTIVO`);
    console.log(`🔗 GitHub: ${finalStatus.active ? 'CONECTADO' : 'DESCONECTADO'}`);
    console.log(`🔄 MCPs Sincronizados: ${syncedCount}/${Object.keys(syncResult).length}`);
    
    if (finalStatus.active && finalStatus.repo_status.has_unpushed_commits) {
      console.log(`⚠️  Commits pendientes: ${finalStatus.repo_status.unpushed_commits_count}`);
    }
    
    console.log('\n🎯 ¡Sistema listo para orquestar tareas complejas!');
    console.log('💡 Puedes usar las siguientes herramientas:');
    console.log('   - orchestrate_task: Orquestar tareas complejas');
    console.log('   - delegate_to_mcp: Delegar a MCPs específicos');
    console.log('   - sync_project_state: Sincronizar estado del proyecto');
    console.log('   - get_system_status: Ver estado del sistema');
    console.log('   - activate_github: Activar GitHub');
    
  } catch (error) {
    console.error('❌ Error activando sistema:', error);
  }
}

activateSystem();
