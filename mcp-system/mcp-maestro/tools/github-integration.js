import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

/**
 * GITHUB INTEGRATION - Integración con GitHub
 * 
 * Responsabilidades:
 * - Activar GitHub automáticamente
 * - Verificar estado del repositorio
 * - Gestionar conexión con GitHub
 * - Proporcionar información del repositorio
 */
export class GitHubIntegration {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.projectRoot = path.join(baseDir, '..', '..');
    this.isActive = false;
    this.repoInfo = null;
  }

  /**
   * Activar integración con GitHub
   */
  async activate(force = false) {
    try {
      console.log('🔗 Activando integración con GitHub...');
      
      // Verificar si ya está activo
      if (this.isActive && !force) {
        console.log('✅ GitHub ya está activo');
        return {
          success: true,
          already_active: true,
          repo_info: this.repoInfo
        };
      }

      // Verificar si estamos en un repositorio Git
      const isGitRepo = await this.checkGitRepository();
      if (!isGitRepo) {
        console.log('❌ No se encontró repositorio Git');
        return {
          success: false,
          error: 'No se encontró repositorio Git',
          recommendation: 'Inicializar repositorio Git o navegar al directorio correcto'
        };
      }

      // Obtener información del repositorio
      this.repoInfo = await this.getRepositoryInfo();
      
      // Verificar conexión con GitHub
      const connectionStatus = await this.checkGitHubConnection();
      
      // Verificar estado del repositorio
      const repoStatus = await this.getRepositoryStatus();
      
      // Activar integración
      this.isActive = true;
      
      console.log('✅ Integración con GitHub activada');
      
      return {
        success: true,
        repo_info: this.repoInfo,
        connection_status: connectionStatus,
        repo_status: repoStatus,
        activated_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error activando GitHub:', error);
      return {
        success: false,
        error: error.message,
        recommendation: 'Verificar configuración de Git y GitHub'
      };
    }
  }

  /**
   * Verificar si estamos en un repositorio Git
   */
  async checkGitRepository() {
    try {
      const gitDir = path.join(this.projectRoot, '.git');
      await fs.access(gitDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtener información del repositorio
   */
  async getRepositoryInfo() {
    try {
      // Obtener URL remota
      const remoteUrl = execSync('git config --get remote.origin.url', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();

      // Obtener nombre del repositorio
      const repoName = this.extractRepoName(remoteUrl);
      
      // Obtener branch actual
      const currentBranch = execSync('git branch --show-current', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();

      // Obtener último commit
      const lastCommit = execSync('git log -1 --format="%H|%an|%ae|%s|%cd"', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();

      const [hash, author, email, subject, date] = lastCommit.split('|');

      return {
        remote_url: remoteUrl,
        repo_name: repoName,
        current_branch: currentBranch,
        last_commit: {
          hash: hash,
          author: author,
          email: email,
          subject: subject,
          date: date
        },
        is_github: remoteUrl.includes('github.com')
      };
      
    } catch (error) {
      console.error('Error obteniendo información del repositorio:', error);
      return {
        error: error.message,
        is_github: false
      };
    }
  }

  /**
   * Verificar conexión con GitHub
   */
  async checkGitHubConnection() {
    try {
      if (!this.repoInfo || !this.repoInfo.is_github) {
        return {
          connected: false,
          error: 'No es un repositorio de GitHub'
        };
      }

      // Verificar si podemos hacer fetch
      execSync('git fetch --dry-run', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

      return {
        connected: true,
        status: 'Conectado a GitHub'
      };
      
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        recommendation: 'Verificar credenciales de GitHub'
      };
    }
  }

  /**
   * Obtener estado del repositorio
   */
  async getRepositoryStatus() {
    try {
      // Verificar si hay cambios sin commitear
      const status = execSync('git status --porcelain', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();

      const hasChanges = status.length > 0;
      
      // Contar archivos modificados
      const modifiedFiles = hasChanges ? status.split('\n').length : 0;
      
      // Verificar si hay commits sin push
      let unpushedCommits = '';
      try {
        unpushedCommits = execSync('git log --oneline origin/HEAD..HEAD', { 
          cwd: this.projectRoot,
          encoding: 'utf8' 
        }).trim();
      } catch (error) {
        // Si no hay origin/HEAD, verificar si hay commits locales
        try {
          const localCommits = execSync('git log --oneline -5', { 
            cwd: this.projectRoot,
            encoding: 'utf8' 
          }).trim();
          unpushedCommits = localCommits;
        } catch (localError) {
          unpushedCommits = '';
        }
      }

      const hasUnpushedCommits = unpushedCommits.length > 0;
      const unpushedCount = hasUnpushedCommits ? unpushedCommits.split('\n').length : 0;

      return {
        has_changes: hasChanges,
        modified_files: modifiedFiles,
        has_unpushed_commits: hasUnpushedCommits,
        unpushed_commits_count: unpushedCount,
        status_summary: this.generateStatusSummary(hasChanges, hasUnpushedCommits)
      };
      
    } catch (error) {
      console.error('Error obteniendo estado del repositorio:', error);
      return {
        error: error.message
      };
    }
  }

  /**
   * Extraer nombre del repositorio de la URL
   */
  extractRepoName(remoteUrl) {
    try {
      // Manejar diferentes formatos de URL
      if (remoteUrl.includes('github.com')) {
        const match = remoteUrl.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
        return match ? match[1] : 'unknown';
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Generar resumen del estado
   */
  generateStatusSummary(hasChanges, hasUnpushedCommits) {
    if (hasChanges && hasUnpushedCommits) {
      return 'Cambios locales y commits sin push';
    } else if (hasChanges) {
      return 'Cambios locales sin commitear';
    } else if (hasUnpushedCommits) {
      return 'Commits sin push';
    } else {
      return 'Repositorio limpio';
    }
  }

  /**
   * Obtener información del repositorio actual
   */
  getCurrentRepoInfo() {
    return this.repoInfo;
  }

  /**
   * Verificar si la integración está activa
   */
  isIntegrationActive() {
    return this.isActive;
  }

  /**
   * Obtener estado completo de la integración
   */
  async getIntegrationStatus() {
    if (!this.isActive) {
      return {
        active: false,
        message: 'Integración no activada'
      };
    }

    const connectionStatus = await this.checkGitHubConnection();
    const repoStatus = await this.getRepositoryStatus();

    return {
      active: true,
      repo_info: this.repoInfo,
      connection_status: connectionStatus,
      repo_status: repoStatus,
      last_checked: new Date().toISOString()
    };
  }

  /**
   * Crear commit automático
   */
  async createAutoCommit(message, files = []) {
    try {
      if (!this.isActive) {
        throw new Error('Integración con GitHub no está activa');
      }

      // Agregar archivos específicos o todos los cambios
      if (files.length > 0) {
        for (const file of files) {
          execSync(`git add "${file}"`, { cwd: this.projectRoot });
        }
      } else {
        execSync('git add .', { cwd: this.projectRoot });
      }

      // Crear commit
      execSync(`git commit -m "${message}"`, { cwd: this.projectRoot });

      return {
        success: true,
        message: 'Commit creado exitosamente',
        commit_message: message
      };
      
    } catch (error) {
      console.error('Error creando commit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Hacer push automático
   */
  async pushToRemote(branch = null) {
    try {
      if (!this.isActive) {
        throw new Error('Integración con GitHub no está activa');
      }

      const targetBranch = branch || this.repoInfo.current_branch;
      execSync(`git push origin ${targetBranch}`, { cwd: this.projectRoot });

      return {
        success: true,
        message: 'Push realizado exitosamente',
        branch: targetBranch
      };
      
    } catch (error) {
      console.error('Error haciendo push:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener historial de commits recientes
   */
  async getRecentCommits(limit = 10) {
    try {
      const commits = execSync(`git log --oneline -${limit}`, { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();

      return commits.split('\n').map(commit => {
        const [hash, ...messageParts] = commit.split(' ');
        return {
          hash: hash,
          message: messageParts.join(' ')
        };
      });
      
    } catch (error) {
      console.error('Error obteniendo commits recientes:', error);
      return [];
    }
  }

  /**
   * Verificar si hay conflictos
   */
  async checkForConflicts() {
    try {
      const status = execSync('git status --porcelain', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();

      const hasConflicts = status.includes('UU') || status.includes('AA');
      
      return {
        has_conflicts: hasConflicts,
        status: status,
        recommendation: hasConflicts ? 'Resolver conflictos antes de continuar' : null
      };
      
    } catch (error) {
      console.error('Error verificando conflictos:', error);
      return {
        has_conflicts: false,
        error: error.message
      };
    }
  }
}
