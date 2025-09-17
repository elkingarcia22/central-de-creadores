import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

export interface PromptTemplate {
  system: string;
  output_schema: any;
}

export interface LoadedPrompt {
  key: string;
  template: PromptTemplate;
  outputSchema: z.ZodSchema;
}

/**
 * Carga una plantilla de prompt desde un archivo YAML
 * @param key - Clave del prompt (nombre del archivo sin extensión)
 * @returns Plantilla cargada con esquema de validación
 */
export function loadPrompt(key: string): LoadedPrompt {
  const promptsDir = path.join(__dirname, '../prompts');
  const filePath = path.join(promptsDir, `${key}.yml`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt template not found: ${key}`);
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const template = yaml.load(fileContent) as PromptTemplate;
  
  if (!template.system || !template.output_schema) {
    throw new Error(`Invalid prompt template format: ${key}`);
  }
  
  // Convertir JSON Schema a Zod Schema
  const outputSchema = jsonSchemaToZod(template.output_schema);
  
  return {
    key,
    template,
    outputSchema
  };
}

/**
 * Convierte un JSON Schema básico a un Zod Schema
 * @param schema - JSON Schema
 * @returns Zod Schema equivalente
 */
function jsonSchemaToZod(schema: any): z.ZodSchema {
  if (schema.type === 'object') {
    const shape: Record<string, z.ZodTypeAny> = {};
    
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        shape[key] = jsonSchemaToZod(prop);
      }
    }
    
    return z.object(shape);
  }
  
  if (schema.type === 'array') {
    const itemSchema = jsonSchemaToZod(schema.items);
    return z.array(itemSchema);
  }
  
  if (schema.type === 'string') {
    let zodString = z.string();
    if (schema.minLength) {
      zodString = zodString.min(schema.minLength);
    }
    return zodString;
  }
  
  if (schema.type === 'number') {
    let zodNumber = z.number();
    if (schema.minimum !== undefined) {
      zodNumber = zodNumber.min(schema.minimum);
    }
    if (schema.maximum !== undefined) {
      zodNumber = zodNumber.max(schema.maximum);
    }
    return zodNumber;
  }
  
  if (schema.type === 'integer') {
    let zodInt = z.number().int();
    if (schema.minimum !== undefined) {
      zodInt = zodInt.min(schema.minimum);
    }
    if (schema.maximum !== undefined) {
      zodInt = zodInt.max(schema.maximum);
    }
    return zodInt;
  }
  
  if (schema.type === 'boolean') {
    return z.boolean();
  }
  
  // Fallback para tipos no soportados
  return z.any();
}

/**
 * Lista todos los prompts disponibles
 * @returns Array de claves de prompts disponibles
 */
export function listAvailablePrompts(): string[] {
  const promptsDir = path.join(__dirname, '../prompts');
  
  if (!fs.existsSync(promptsDir)) {
    return [];
  }
  
  return fs.readdirSync(promptsDir)
    .filter(file => file.endsWith('.yml'))
    .map(file => file.replace('.yml', ''));
}

/**
 * Valida un output contra el esquema de un prompt
 * @param promptKey - Clave del prompt
 * @param output - Output a validar
 * @returns Resultado de la validación
 */
export function validateOutput(promptKey: string, output: any): { success: boolean; error?: string } {
  try {
    const prompt = loadPrompt(promptKey);
    prompt.outputSchema.parse(output);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}
