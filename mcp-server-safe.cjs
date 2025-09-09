#!/usr/bin/env node
/**
 * MCP Server SEGURO para Central de Creadores
 * VERSIÓN SIN AUTOCOMMIT - Solo operaciones manuales y seguras
 */
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Cliente Supabase
let supabaseClient = null;

function initializeSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Variables de entorno de Supabase no configuradas');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// ====================================
// FUNCIONES DE GIT SEGURAS (SOLO LECTURA)
// ====================================

async function executeGitCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf-8', 
      cwd: process.cwd(),
      ...options 
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout ? error.stdout.toString().trim() : '',
      stderr: error.stderr ? error.stderr.toString().trim() : ''
    };
  }
}

async function getGitStatus() {
  try {
    const status = await executeGitCommand('git status --porcelain');
    const branch = await executeGitCommand('git branch --show-current');
    const remote = await executeGitCommand('git remote -v');
    const lastCommit = await executeGitCommand('git log -1 --oneline');
    
    return {
      success: true,
      data: {
        branch: branch.output,
        status: status.output,
        remote: remote.output,
        lastCommit: lastCommit.output,
        hasChanges: status.output.length > 0
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getGitLog(limit = 10) {
  try {
    const logResult = await executeGitCommand(`git log --oneline -${limit}`);
    return {
      success: true,
      commits: logResult.output.split('\n').filter(line => line.trim())
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getGitDiff() {
  try {
    const diffResult = await executeGitCommand('git diff');
    const stagedDiffResult = await executeGitCommand('git diff --staged');
    
    return {
      success: true,
      unstaged: diffResult.output,
      staged: stagedDiffResult.output
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function listBranches() {
  try {
    const localBranches = await executeGitCommand('git branch');
    const remoteBranches = await executeGitCommand('git branch -r');
    
    return {
      success: true,
      local: localBranches.output.split('\n').map(b => b.trim().replace('* ', '')),
      remote: remoteBranches.output.split('\n').map(b => b.trim())
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ====================================
// FUNCIONES DE GITHUB API (SOLO LECTURA)
// ====================================

async function getGitHubIssues(state = 'open') {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO;
    
    if (!githubToken || !githubRepo) {
      return { success: false, error: 'GitHub token o repositorio no configurado' };
    }
    
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/issues?state=${state}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Error obteniendo issues' };
    }
    
    const issues = await response.json();
    return {
      success: true,
      issues: issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        url: issue.html_url,
        labels: issue.labels.map(label => label.name),
        created_at: issue.created_at,
        updated_at: issue.updated_at
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getGitHubPullRequests(state = 'open') {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO;
    
    if (!githubToken || !githubRepo) {
      return { success: false, error: 'GitHub token o repositorio no configurado' };
    }
    
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/pulls?state=${state}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Error obteniendo pull requests' };
    }
    
    const pulls = await response.json();
    return {
      success: true,
      pullRequests: pulls.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        url: pr.html_url,
        head: pr.head.ref,
        base: pr.base.ref,
        created_at: pr.created_at,
        updated_at: pr.updated_at
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ====================================
// FUNCIONES DE SUPABASE
// ====================================

async function testConnection() {
  try {
    if (!supabaseClient) {
      supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return '❌ **Error**: No se pudo inicializar Supabase';
      }
    }

    // Probar conexión con una consulta simple
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      return `❌ **Error de conexión**: ${error.message}`;
    }

    return '✅ **Conexión exitosa**: MCP SEGURO funcionando correctamente\n\n' +
           '🔧 **Herramientas disponibles (SOLO LECTURA)**:\n' +
           '- test_connection: Prueba la conexión con Supabase\n' +
           '- git_status: Muestra el estado actual de Git\n' +
           '- git_log: Muestra el historial de commits\n' +
           '- git_diff: Muestra las diferencias en el código\n' +
           '- list_branches: Lista todas las ramas\n' +
           '- get_github_issues: Obtiene issues de GitHub\n' +
           '- get_github_pull_requests: Obtiene pull requests de GitHub\n\n' +
           '⚠️ **NOTA**: Esta versión NO incluye comandos de escritura (commit, push, pull) por seguridad';
  } catch (error) {
    return `❌ **Error**: ${error.message}`;
  }
}

// ====================================
// MANEJADOR PRINCIPAL
// ====================================

async function handleCommand(command, args = {}) {
  try {
    switch (command) {
      // Git Commands (SOLO LECTURA)
      case 'git_status':
        const status = await getGitStatus();
        if (status.success) {
          return `## 📊 **Estado de Git**\n\n` +
                 `**Rama actual**: ${status.data.branch}\n` +
                 `**Último commit**: ${status.data.lastCommit}\n` +
                 `**Cambios**: ${status.data.hasChanges ? 'Sí' : 'No'}\n` +
                 `**Estado**:\n\`\`\`\n${status.data.status || 'Sin cambios'}\n\`\`\`\n` +
                 `**Remoto**:\n\`\`\`\n${status.data.remote}\n\`\`\``;
        } else {
          return `❌ **Error**: ${status.error}`;
        }
      
      case 'git_log':
        const { limit = 10 } = args;
        const logResult = await getGitLog(limit);
        if (logResult.success) {
          return `## 📜 **Historial de Commits**\n\n` +
                 logResult.commits.map(commit => `- ${commit}`).join('\n');
        } else {
          return `❌ **Error**: ${logResult.error}`;
        }
      
      case 'git_diff':
        const diffResult = await getGitDiff();
        if (diffResult.success) {
          let output = `## 🔍 **Diferencias en el código**\n\n`;
          
          if (diffResult.staged) {
            output += `### **Cambios en staging**:\n\`\`\`diff\n${diffResult.staged}\n\`\`\`\n\n`;
          }
          
          if (diffResult.unstaged) {
            output += `### **Cambios sin staging**:\n\`\`\`diff\n${diffResult.unstaged}\n\`\`\``;
          }
          
          if (!diffResult.staged && !diffResult.unstaged) {
            output += `✅ **No hay cambios pendientes**`;
          }
          
          return output;
        } else {
          return `❌ **Error**: ${diffResult.error}`;
        }
      
      case 'list_branches':
        const branchesResult = await listBranches();
        if (branchesResult.success) {
          return `## 🌿 **Ramas disponibles**\n\n` +
                 `### **Ramas locales**:\n${branchesResult.local.map(b => `- ${b}`).join('\n')}\n\n` +
                 `### **Ramas remotas**:\n${branchesResult.remote.map(b => `- ${b}`).join('\n')}`;
        } else {
          return `❌ **Error**: ${branchesResult.error}`;
        }
      
      // GitHub API Commands (SOLO LECTURA)
      case 'get_github_issues':
        const { state } = args;
        const issuesResult = await getGitHubIssues(state);
        if (issuesResult.success) {
          return `## 📋 **Issues de GitHub**\n\n` +
                 issuesResult.issues.map(issue => 
                   `### #${issue.number} - ${issue.title}\n` +
                   `**Estado**: ${issue.state}\n` +
                   `**Labels**: ${issue.labels.join(', ')}\n` +
                   `**Creado**: ${new Date(issue.created_at).toLocaleDateString()}\n` +
                   `**URL**: ${issue.url}\n`
                 ).join('\n');
        } else {
          return `❌ **Error**: ${issuesResult.error}`;
        }
      
      case 'get_github_pull_requests':
        const { state: prState } = args;
        const prResult = await getGitHubPullRequests(prState);
        if (prResult.success) {
          return `## 🔄 **Pull Requests de GitHub**\n\n` +
                 prResult.pullRequests.map(pr => 
                   `### #${pr.number} - ${pr.title}\n` +
                   `**Estado**: ${pr.state}\n` +
                   `**De**: ${pr.head} → **A**: ${pr.base}\n` +
                   `**Creado**: ${new Date(pr.created_at).toLocaleDateString()}\n` +
                   `**URL**: ${pr.url}\n`
                 ).join('\n');
        } else {
          return `❌ **Error**: ${prResult.error}`;
        }
      
      // Supabase Commands
      case 'test_connection':
        return await testConnection();
      
      default:
        return `❌ **Comando no reconocido**: ${command}\n\n` +
               `**Comandos disponibles (SOLO LECTURA)**:\n` +
               `- git_status: Estado de Git\n` +
               `- git_log: Historial de commits\n` +
               `- git_diff: Diferencias en el código\n` +
               `- list_branches: Lista de ramas\n` +
               `- get_github_issues: Issues de GitHub\n` +
               `- get_github_pull_requests: Pull requests de GitHub\n` +
               `- test_connection: Prueba conexión Supabase\n\n` +
               `⚠️ **NOTA**: Esta versión NO incluye comandos de escritura por seguridad`;
    }
  } catch (error) {
    return `❌ **Error**: ${error.message}`;
  }
}

// ====================================
// INTERFAZ DE LÍNEA DE COMANDOS
// ====================================

async function main() {
  try {
    console.log('🚀 MCP Server SEGURO iniciando...');
    
    // Cargar variables de entorno
    require('dotenv').config({ path: './mcp-config.env' });
    
    console.log('✅ MCP Server SEGURO listo');
    console.log('\n🔧 **Herramientas disponibles (SOLO LECTURA)**:');
    console.log('- git_status: Muestra el estado actual de Git');
    console.log('- git_log: Muestra el historial de commits');
    console.log('- git_diff: Muestra las diferencias en el código');
    console.log('- list_branches: Lista todas las ramas');
    console.log('- get_github_issues: Obtiene issues de GitHub');
    console.log('- get_github_pull_requests: Obtiene pull requests de GitHub');
    console.log('- test_connection: Prueba la conexión con Supabase');
    
    console.log('\n⚠️ **IMPORTANTE**: Esta versión NO incluye comandos de escritura (commit, push, pull) por seguridad');
    
    // Si se pasan argumentos, ejecutar comando
    if (process.argv.length > 2) {
      const command = process.argv[2];
      const args = process.argv.slice(3).reduce((acc, arg, index) => {
        if (arg.startsWith('--')) {
          const key = arg.substring(2);
          const value = process.argv[index + 3];
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const result = await handleCommand(command, args);
      console.log(result);
      return;
    }
    
    console.log('\n💡 **Para usar en Cursor**:');
    console.log('1. Configura el archivo mcp.json en Cursor con mcp-server-safe.cjs');
    console.log('2. Reinicia Cursor');
    console.log('3. Usa las herramientas desde el chat');
    
    // Mantener el servidor activo
    console.log('\n🔄 Servidor ejecutándose... (Presiona Ctrl+C para detener)');
    
    // El servidor se mantiene activo
    process.on('SIGINT', () => {
      console.log('\n🛑 MCP Server SEGURO detenido');
      process.exit(0);
    });
    
    // Mantener el proceso vivo
    setInterval(() => {
      // Heartbeat cada 30 segundos para mantener el proceso activo
    }, 30000);
    
  } catch (error) {
    console.error('❌ Error iniciando MCP Server SEGURO:', error);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

// Exportar funciones para uso externo
module.exports = {
  handleCommand,
  testConnection,
  getGitStatus,
  getGitLog,
  getGitDiff,
  listBranches,
  getGitHubIssues,
  getGitHubPullRequests
};
