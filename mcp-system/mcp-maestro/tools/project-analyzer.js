import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

/**
 * PROJECT ANALYZER - Analizador de Proyecto
 * 
 * Responsabilidades:
 * - Analizar la estructura del proyecto
 * - Verificar información antes de asumir
 * - Validar existencia de archivos y configuraciones
 * - Proporcionar contexto del proyecto
 */
export class ProjectAnalyzer {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.projectRoot = path.join(baseDir, '..', '..');
    this.cache = new Map();
  }

  /**
   * Analizar el proyecto completo
   */
  async analyzeProject() {
    try {
      console.log('🔍 Analizando proyecto...');
      
      const analysis = {
        project_name: 'central-de-creadores',
        version: '1.0.0',
        structure: await this.analyzeStructure(),
        dependencies: await this.analyzeDependencies(),
        configuration: await this.analyzeConfiguration(),
        database: await this.analyzeDatabase(),
        api_endpoints: await this.analyzeAPIEndpoints(),
        components: await this.analyzeComponents(),
        last_updated: new Date().toISOString()
      };

      // Guardar en cache
      this.cache.set('project_analysis', analysis);
      
      console.log('✅ Análisis del proyecto completado');
      return analysis;
      
    } catch (error) {
      console.error('❌ Error analizando proyecto:', error);
      throw error;
    }
  }

  /**
   * Verificar información específica antes de asumir
   */
  async verifyInformation(query, context = 'general') {
    try {
      console.log(`🔍 Verificando: ${query}`);
      
      const verification = {
        query,
        context,
        is_verified: false,
        missing_info: [],
        recommendations: [],
        details: {}
      };

      // Analizar la consulta para determinar qué verificar
      const checks = this.parseQueryForChecks(query);
      
      for (const check of checks) {
        const result = await this.performCheck(check);
        verification.details[check.type] = result;
        
        if (!result.exists) {
          verification.missing_info.push(check.description);
        }
      }

      // Determinar si toda la información está verificada
      verification.is_verified = verification.missing_info.length === 0;
      
      // Generar recomendaciones
      verification.recommendations = this.generateRecommendations(verification);
      
      return verification;
      
    } catch (error) {
      console.error('❌ Error verificando información:', error);
      return {
        query,
        context,
        is_verified: false,
        error: error.message,
        missing_info: ['Error en verificación'],
        recommendations: ['Revisar logs del sistema']
      };
    }
  }

  /**
   * Analizar estructura del proyecto
   */
  async analyzeStructure() {
    try {
      const structure = {
        directories: [],
        files: [],
        total_files: 0,
        total_directories: 0
      };

      const scanResult = await this.scanDirectory(this.projectRoot);
      structure.directories = scanResult.directories;
      structure.files = scanResult.files;
      structure.total_files = scanResult.files.length;
      structure.total_directories = scanResult.directories.length;

      return structure;
    } catch (error) {
      console.error('Error analizando estructura:', error);
      return { error: error.message };
    }
  }

  /**
   * Analizar dependencias
   */
  async analyzeDependencies() {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      return {
        name: packageJson.name,
        version: packageJson.version,
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        scripts: Object.keys(packageJson.scripts || {})
      };
    } catch (error) {
      console.error('Error analizando dependencias:', error);
      return { error: error.message };
    }
  }

  /**
   * Analizar configuración
   */
  async analyzeConfiguration() {
    try {
      const config = {
        nextjs: await this.checkFileExists('next.config.js'),
        typescript: await this.checkFileExists('tsconfig.json'),
        tailwind: await this.checkFileExists('tailwind.config.js'),
        eslint: await this.checkFileExists('.eslintrc.json'),
        env_files: await this.findEnvFiles()
      };

      return config;
    } catch (error) {
      console.error('Error analizando configuración:', error);
      return { error: error.message };
    }
  }

  /**
   * Analizar base de datos
   */
  async analyzeDatabase() {
    try {
      const database = {
        supabase: await this.checkSupabaseConfig(),
        sql_files: await this.findSQLFiles(),
        migrations: await this.findMigrations()
      };

      return database;
    } catch (error) {
      console.error('Error analizando base de datos:', error);
      return { error: error.message };
    }
  }

  /**
   * Analizar endpoints de API
   */
  async analyzeAPIEndpoints() {
    try {
      const apiDir = path.join(this.projectRoot, 'src', 'pages', 'api');
      const endpoints = await this.scanAPIDirectory(apiDir);
      
      return {
        total_endpoints: endpoints.length,
        endpoints: endpoints
      };
    } catch (error) {
      console.error('Error analizando API endpoints:', error);
      return { error: error.message };
    }
  }

  /**
   * Analizar componentes
   */
  async analyzeComponents() {
    try {
      const componentsDir = path.join(this.projectRoot, 'src', 'components');
      const components = await this.scanComponentsDirectory(componentsDir);
      
      return {
        total_components: components.length,
        components: components
      };
    } catch (error) {
      console.error('Error analizando componentes:', error);
      return { error: error.message };
    }
  }

  /**
   * Escanear directorio recursivamente
   */
  async scanDirectory(dirPath, maxDepth = 3, currentDepth = 0) {
    if (currentDepth > maxDepth) return { directories: [], files: [] };

    try {
      const items = await fs.readdir(dirPath);
      const directories = [];
      const files = [];

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          directories.push({
            name: item,
            path: path.relative(this.projectRoot, fullPath),
            depth: currentDepth
          });

          if (currentDepth < maxDepth) {
            const subResult = await this.scanDirectory(fullPath, maxDepth, currentDepth + 1);
            directories.push(...subResult.directories);
            files.push(...subResult.files);
          }
        } else {
          files.push({
            name: item,
            path: path.relative(this.projectRoot, fullPath),
            size: stat.size,
            extension: path.extname(item)
          });
        }
      }

      return { directories, files };
    } catch (error) {
      console.error(`Error escaneando directorio ${dirPath}:`, error);
      return { directories: [], files: [] };
    }
  }

  /**
   * Verificar si un archivo existe
   */
  async checkFileExists(filePath) {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      await fs.access(fullPath);
      return { exists: true, path: filePath };
    } catch {
      return { exists: false, path: filePath };
    }
  }

  /**
   * Buscar archivos .env
   */
  async findEnvFiles() {
    try {
      const items = await fs.readdir(this.projectRoot);
      return items.filter(item => item.startsWith('.env'));
    } catch (error) {
      return [];
    }
  }

  /**
   * Verificar configuración de Supabase
   */
  async checkSupabaseConfig() {
    try {
      const supabaseConfig = await this.checkFileExists('src/api/supabase.ts');
      const envLocal = await this.checkFileExists('.env.local');
      
      return {
        config_file: supabaseConfig.exists,
        env_file: envLocal.exists,
        configured: supabaseConfig.exists && envLocal.exists
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Buscar archivos SQL
   */
  async findSQLFiles() {
    try {
      const sqlFiles = [];
      const scanResult = await this.scanDirectory(this.projectRoot);
      
      for (const file of scanResult.files) {
        if (file.extension === '.sql') {
          sqlFiles.push(file);
        }
      }
      
      return sqlFiles;
    } catch (error) {
      return [];
    }
  }

  /**
   * Buscar migraciones
   */
  async findMigrations() {
    try {
      const migrations = [];
      const scanResult = await this.scanDirectory(this.projectRoot);
      
      for (const file of scanResult.files) {
        if (file.name.includes('migration') || file.name.includes('update')) {
          migrations.push(file);
        }
      }
      
      return migrations;
    } catch (error) {
      return [];
    }
  }

  /**
   * Escanear directorio de API
   */
  async scanAPIDirectory(apiDir) {
    try {
      const endpoints = [];
      const scanResult = await this.scanDirectory(apiDir, 2);
      
      for (const file of scanResult.files) {
        if (file.extension === '.ts' || file.extension === '.js') {
          endpoints.push({
            name: file.name,
            path: file.path,
            route: this.extractRouteFromPath(file.path)
          });
        }
      }
      
      return endpoints;
    } catch (error) {
      return [];
    }
  }

  /**
   * Escanear directorio de componentes
   */
  async scanComponentsDirectory(componentsDir) {
    try {
      const components = [];
      const scanResult = await this.scanDirectory(componentsDir, 3);
      
      for (const file of scanResult.files) {
        if (file.extension === '.tsx' || file.extension === '.jsx') {
          components.push({
            name: file.name,
            path: file.path,
            type: this.determineComponentType(file.path)
          });
        }
      }
      
      return components;
    } catch (error) {
      return [];
    }
  }

  /**
   * Extraer ruta de API desde path
   */
  extractRouteFromPath(filePath) {
    return filePath
      .replace('src/pages/api/', '')
      .replace(/\.(ts|js)$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1');
  }

  /**
   * Determinar tipo de componente
   */
  determineComponentType(filePath) {
    if (filePath.includes('ui/')) return 'ui';
    if (filePath.includes('auth/')) return 'auth';
    if (filePath.includes('design-system/')) return 'design-system';
    return 'custom';
  }

  /**
   * Parsear consulta para determinar verificaciones
   */
  parseQueryForChecks(query) {
    const checks = [];
    const lowerQuery = query.toLowerCase();

    // Verificar archivos específicos
    if (lowerQuery.includes('package.json') || lowerQuery.includes('dependencia')) {
      checks.push({
        type: 'package_json',
        description: 'Archivo package.json',
        path: 'package.json'
      });
    }

    if (lowerQuery.includes('supabase') || lowerQuery.includes('base de datos')) {
      checks.push({
        type: 'supabase_config',
        description: 'Configuración de Supabase',
        path: 'src/api/supabase.ts'
      });
    }

    if (lowerQuery.includes('componente') || lowerQuery.includes('react')) {
      checks.push({
        type: 'components',
        description: 'Directorio de componentes',
        path: 'src/components'
      });
    }

    if (lowerQuery.includes('api') || lowerQuery.includes('endpoint')) {
      checks.push({
        type: 'api_endpoints',
        description: 'Endpoints de API',
        path: 'src/pages/api'
      });
    }

    if (lowerQuery.includes('sql') || lowerQuery.includes('migración')) {
      checks.push({
        type: 'sql_files',
        description: 'Archivos SQL',
        path: '*.sql'
      });
    }

    // Verificación general si no hay checks específicos
    if (checks.length === 0) {
      checks.push({
        type: 'project_structure',
        description: 'Estructura básica del proyecto',
        path: 'src'
      });
    }

    return checks;
  }

  /**
   * Realizar verificación específica
   */
  async performCheck(check) {
    try {
      switch (check.type) {
        case 'package_json':
          return await this.checkFileExists('package.json');
          
        case 'supabase_config':
          return await this.checkFileExists('src/api/supabase.ts');
          
        case 'components':
          return await this.checkFileExists('src/components');
          
        case 'api_endpoints':
          return await this.checkFileExists('src/pages/api');
          
        case 'sql_files':
          const sqlFiles = await this.findSQLFiles();
          return { exists: sqlFiles.length > 0, count: sqlFiles.length };
          
        case 'project_structure':
          return await this.checkFileExists('src');
          
        default:
          return { exists: false, error: 'Tipo de verificación desconocido' };
      }
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  /**
   * Generar recomendaciones basadas en verificación
   */
  generateRecommendations(verification) {
    const recommendations = [];

    if (verification.missing_info.length > 0) {
      recommendations.push('Revisar la estructura del proyecto');
      recommendations.push('Verificar archivos de configuración');
      recommendations.push('Comprobar dependencias instaladas');
    }

    if (verification.details.supabase_config && !verification.details.supabase_config.exists) {
      recommendations.push('Configurar Supabase correctamente');
    }

    if (verification.details.components && !verification.details.components.exists) {
      recommendations.push('Crear directorio de componentes');
    }

    return recommendations;
  }
}
