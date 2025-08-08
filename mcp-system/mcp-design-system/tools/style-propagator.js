import fs from 'fs/promises';
import path from 'path';
import glob from 'glob';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export class StylePropagator {
  constructor(configPath) {
    this.config = null;
    this.configPath = configPath;
  }

  async init() {
    const configFile = await fs.readFile(this.configPath, 'utf8');
    this.config = JSON.parse(configFile);
  }

  async propagateTokenChange(tokenPath, newValue) {
    console.log(`🔄 Propagando cambio de token: ${tokenPath} = ${newValue}`);

    // 1. Identificar el token y su configuración
    const tokenConfig = this.getTokenConfig(tokenPath);
    if (!tokenConfig) {
      throw new Error(`Token no encontrado: ${tokenPath}`);
    }

    // 2. Encontrar archivos afectados
    const affectedFiles = await this.findAffectedFiles(tokenConfig);

    // 3. Crear respaldos si está configurado
    if (this.config.propagation.backup_files) {
      await this.createBackups(affectedFiles);
    }

    // 4. Actualizar cada archivo
    const results = [];
    for (const file of affectedFiles) {
      try {
        const result = await this.updateFile(file, tokenConfig, newValue);
        results.push(result);
      } catch (error) {
        console.error(`Error actualizando ${file}:`, error);
        results.push({
          file,
          success: false,
          error: error.message
        });
      }
    }

    // 5. Actualizar dependencias si está configurado
    if (this.config.propagation.update_dependencies) {
      await this.updateDependencies(tokenPath, newValue);
    }

    // 6. Actualizar stories si está configurado
    if (this.config.propagation.update_stories) {
      await this.updateStories(tokenPath, newValue);
    }

    return {
      token_path: tokenPath,
      new_value: newValue,
      affected_files: affectedFiles.length,
      results
    };
  }

  getTokenConfig(tokenPath) {
    const [category, name, ...rest] = tokenPath.split('.');
    const tokens = this.config.token_mapping[category];
    
    if (!tokens) {
      return null;
    }

    return tokens[name] || null;
  }

  async findAffectedFiles(tokenConfig) {
    const affectedFiles = new Set();

    // Buscar en componentes
    for (const pattern of this.config.file_patterns.components) {
      const files = await this.globPromise(pattern);
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8');
        if (this.fileUsesToken(content, tokenConfig)) {
          affectedFiles.add(file);
        }
      }
    }

    // Buscar en estilos
    for (const pattern of this.config.file_patterns.styles) {
      const files = await this.globPromise(pattern);
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8');
        if (this.fileUsesToken(content, tokenConfig)) {
          affectedFiles.add(file);
        }
      }
    }

    return Array.from(affectedFiles);
  }

  async createBackups(files) {
    for (const file of files) {
      const backupPath = `${file}.backup`;
      await fs.copyFile(file, backupPath);
    }
  }

  async updateFile(file, tokenConfig, newValue) {
    const content = await fs.readFile(file, 'utf8');
    const ext = path.extname(file);

    let updatedContent;
    if (ext === '.tsx' || ext === '.jsx') {
      updatedContent = await this.updateJSXFile(content, tokenConfig, newValue);
    } else if (ext === '.css' || ext === '.scss') {
      updatedContent = await this.updateStyleFile(content, tokenConfig, newValue);
    }

    if (updatedContent !== content) {
      await fs.writeFile(file, updatedContent);
      return {
        file,
        success: true,
        changes_made: true
      };
    }

    return {
      file,
      success: true,
      changes_made: false
    };
  }

  async updateJSXFile(content, tokenConfig, newValue) {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    let modified = false;

    traverse(ast, {
      JSXAttribute(path) {
        if (path.node.name.name === 'className') {
          const value = path.node.value.value;
          const updatedValue = this.updateClassNames(value, tokenConfig.classes, newValue);
          if (updatedValue !== value) {
            path.node.value.value = updatedValue;
            modified = true;
          }
        }
      },
      StringLiteral(path) {
        if (this.isStyleVariable(path.node.value, tokenConfig.variables)) {
          path.node.value = this.updateStyleVariable(path.node.value, newValue);
          modified = true;
        }
      }
    });

    if (modified) {
      const output = generate(ast);
      return output.code;
    }

    return content;
  }

  async updateStyleFile(content, tokenConfig, newValue) {
    let updatedContent = content;

    // Actualizar variables CSS
    for (const variable of tokenConfig.variables) {
      const regex = new RegExp(`(${variable}:\\s*)([^;]+)(;)`, 'g');
      updatedContent = updatedContent.replace(regex, `$1${newValue}$3`);
    }

    // Actualizar clases Tailwind
    for (const className of tokenConfig.classes) {
      const regex = new RegExp(`(\\.|@apply[^;]*\\s+)${className}(\\s|$|;)`, 'g');
      const newClass = this.getUpdatedClassName(className, newValue);
      updatedContent = updatedContent.replace(regex, `$1${newClass}$2`);
    }

    return updatedContent;
  }

  async updateDependencies(tokenPath, newValue) {
    // Implementar actualización de dependencias
  }

  async updateStories(tokenPath, newValue) {
    // Implementar actualización de stories
  }

  fileUsesToken(content, tokenConfig) {
    // Verificar si el archivo usa alguna de las clases
    for (const className of tokenConfig.classes) {
      if (content.includes(className)) {
        return true;
      }
    }

    // Verificar si el archivo usa alguna de las variables
    for (const variable of tokenConfig.variables) {
      if (content.includes(variable)) {
        return true;
      }
    }

    return false;
  }

  updateClassNames(value, classes, newValue) {
    let updatedValue = value;
    for (const className of classes) {
      const newClass = this.getUpdatedClassName(className, newValue);
      if (newClass !== className) {
        updatedValue = updatedValue.replace(className, newClass);
      }
    }
    return updatedValue;
  }

  isStyleVariable(value, variables) {
    return variables.some(v => value.includes(v));
  }

  updateStyleVariable(value, newValue) {
    return newValue;
  }

  getUpdatedClassName(className, newValue) {
    // Implementar lógica para actualizar nombres de clases
    return className;
  }

  globPromise(pattern) {
    return new Promise((resolve, reject) => {
      glob(pattern, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
  }
}

export default StylePropagator;
