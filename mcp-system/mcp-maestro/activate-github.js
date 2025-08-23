#!/usr/bin/env node

import { GitHubIntegration } from './tools/github-integration.js';

async function activateGitHub() {
  console.log('🔗 Activando integración específica con GitHub...\n');
  
  try {
    const github = new GitHubIntegration('.');
    
    // Activar GitHub
    console.log('📋 Activando GitHub...');
    const result = await github.activate(true);
    
    if (result.success) {
      console.log('✅ GitHub activado exitosamente');
      console.log('   - Repositorio:', result.repo_info.repo_name);
      console.log('   - Branch:', result.repo_info.current_branch);
      console.log('   - URL:', result.repo_info.remote_url);
      
      if (result.repo_status) {
        console.log('   - Estado:', result.repo_status.status_summary);
        if (result.repo_status.has_unpushed_commits) {
          console.log('   - Commits pendientes:', result.repo_status.unpushed_commits_count);
        }
      }
    } else {
      console.log('❌ Error activando GitHub:', result.error);
      if (result.recommendation) {
        console.log('   Recomendación:', result.recommendation);
      }
    }
    
    // Verificar estado final
    console.log('\n📊 Verificando estado final...');
    const status = await github.getIntegrationStatus();
    console.log('✅ Estado final:', status.active ? 'ACTIVO' : 'INACTIVO');
    
  } catch (error) {
    console.error('❌ Error en activación de GitHub:', error);
  }
}

activateGitHub();
