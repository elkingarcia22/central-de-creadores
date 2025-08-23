#!/usr/bin/env node

import { GitHubIntegration } from './tools/github-integration.js';
import { MCPSyncManager } from './tools/mcp-sync-manager.js';
import { AutoInitializer } from './scripts/auto-init.js';
import fs from 'fs/promises';
import path from 'path';

async function verifyAndActivate() {
  console.log('🎯 Verificando y activando sistema completo MCP Maestro...\n');
  
  try {
    // 1. Verificar y activar MCP Maestro
    console.log('📋 1. Verificando MCP Maestro...');
    const initializer = new AutoInitializer();
    const initStatus = await initializer.checkStatus();
    
    if (!initStatus.initialized) {
      console.log('🔄 Inicializando MCP Maestro...');
      await initializer.initialize();
      console.log('✅ MCP Maestro inicializado');
    } else {
      console.log('✅ MCP Maestro ya está inicializado');
    }
    
    // 2. Verificar y activar GitHub
    console.log('\n🔗 2. Verificando GitHub...');
    const github = new GitHubIntegration('.');
    const githubStatus = await github.getIntegrationStatus();
    
    if (!githubStatus.active) {
      console.log('🔄 Activando GitHub...');
      const githubResult = await github.activate(true);
      if (githubResult.success) {
        console.log('✅ GitHub activado');
        console.log('   - Repositorio:', githubResult.repo_info.repo_name);
        console.log('   - Branch:', githubResult.repo_info.current_branch);
      } else {
        console.log('❌ Error activando GitHub:', githubResult.error);
      }
    } else {
      console.log('✅ GitHub ya está activo');
    }
    
    // 3. Verificar y sincronizar MCPs
    console.log('\n🔄 3. Verificando MCPs...');
    const syncManager = new MCPSyncManager('.');
    const mcpStatus = syncManager.getSyncStatus();
    
    let needsSync = false;
    for (const [mcpName, mcpData] of Object.entries(mcpStatus)) {
      if (mcpData.status !== 'synced') {
        needsSync = true;
        break;
      }
    }
    
    if (needsSync) {
      console.log('🔄 Sincronizando MCPs...');
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
      console.log(`✅ ${syncedCount}/${Object.keys(syncResult).length} MCPs sincronizados`);
    } else {
      console.log('✅ Todos los MCPs ya están sincronizados');
    }
    
    // 4. Verificar estado final
    console.log('\n📊 4. Estado final del sistema:');
    console.log('='.repeat(50));
    
    const finalInitStatus = await initializer.checkStatus();
    const finalGitHubStatus = await github.getIntegrationStatus();
    const finalMCPStatus = syncManager.getSyncStatus();
    
    console.log(`✅ MCP Maestro: ${finalInitStatus.initialized ? 'ACTIVO' : 'INACTIVO'}`);
    console.log(`🔗 GitHub: ${finalGitHubStatus.active ? 'CONECTADO' : 'DESCONECTADO'}`);
    
    const syncedMCPs = Object.values(finalMCPStatus).filter(m => m.status === 'synced').length;
    console.log(`🔄 MCPs Sincronizados: ${syncedMCPs}/${Object.keys(finalMCPStatus).length}`);
    
    if (finalGitHubStatus.active && finalGitHubStatus.repo_status?.has_unpushed_commits) {
      console.log(`⚠️  Commits pendientes: ${finalGitHubStatus.repo_status.unpushed_commits_count}`);
    }
    
    console.log('\n🎯 ¡Sistema MCP Maestro listo para orquestar tareas complejas!');
    
  } catch (error) {
    console.error('❌ Error en verificación y activación:', error);
  }
}

verifyAndActivate();
