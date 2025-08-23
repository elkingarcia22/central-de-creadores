#!/usr/bin/env node

import { GitHubIntegration } from './tools/github-integration.js';
import { MCPSyncManager } from './tools/mcp-sync-manager.js';
import { AutoInitializer } from './scripts/auto-init.js';
import fs from 'fs/promises';
import path from 'path';

async function persistentActivation() {
  console.log('🎯 Activación persistente del sistema MCP Maestro...\n');
  
  try {
    const statusFile = path.join('./storage', 'system-activation-status.json');
    
    // 1. Activar MCP Maestro
    console.log('📋 1. Activando MCP Maestro...');
    const initializer = new AutoInitializer();
    await initializer.initialize();
    console.log('✅ MCP Maestro activado');
    
    // 2. Activar GitHub
    console.log('\n🔗 2. Activando GitHub...');
    const github = new GitHubIntegration('.');
    const githubResult = await github.activate(true);
    
    if (githubResult.success) {
      console.log('✅ GitHub activado');
      console.log('   - Repositorio:', githubResult.repo_info.repo_name);
      console.log('   - Branch:', githubResult.repo_info.current_branch);
    } else {
      console.log('❌ Error activando GitHub:', githubResult.error);
    }
    
    // 3. Sincronizar MCPs
    console.log('\n🔄 3. Sincronizando MCPs...');
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
    
    // 4. Guardar estado persistente
    console.log('\n💾 4. Guardando estado persistente...');
    const activationStatus = {
      mcp_maestro: {
        active: true,
        activated_at: new Date().toISOString(),
        version: '2.0.0'
      },
      github: {
        active: githubResult.success,
        repo_info: githubResult.repo_info,
        activated_at: new Date().toISOString()
      },
      mcps: {
        total: Object.keys(syncResult).length,
        synced: syncedCount,
        status: syncResult,
        last_sync: new Date().toISOString()
      },
      system_status: {
        fully_activated: true,
        last_activation: new Date().toISOString(),
        activation_count: 1
      }
    };
    
    await fs.writeFile(statusFile, JSON.stringify(activationStatus, null, 2));
    console.log('✅ Estado guardado en:', statusFile);
    
    // 5. Verificar estado final
    console.log('\n📊 5. Estado final del sistema:');
    console.log('='.repeat(50));
    console.log(`✅ MCP Maestro: ACTIVO`);
    console.log(`🔗 GitHub: ${githubResult.success ? 'CONECTADO' : 'DESCONECTADO'}`);
    console.log(`🔄 MCPs Sincronizados: ${syncedCount}/${Object.keys(syncResult).length}`);
    
    if (githubResult.repo_status?.has_unpushed_commits) {
      console.log(`⚠️  Commits pendientes: ${githubResult.repo_status.unpushed_commits_count}`);
    }
    
    console.log('\n🎯 ¡Sistema MCP Maestro activado persistentemente!');
    console.log('💡 El estado se ha guardado y persistirá entre sesiones.');
    
  } catch (error) {
    console.error('❌ Error en activación persistente:', error);
  }
}

persistentActivation();
