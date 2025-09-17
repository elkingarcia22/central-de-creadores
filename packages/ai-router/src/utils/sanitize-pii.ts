/**
 * Sanitiza información personal identificable (PII) del texto
 * Reemplaza emails, teléfonos, nombres, etc. con placeholders
 */

export function sanitizePII(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let sanitized = text;

  // Patrones de PII comunes
  const patterns = [
    // Emails
    {
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      replacement: '[EMAIL]'
    },
    // Teléfonos (varios formatos)
    {
      regex: /(\+?57\s?)?[1-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}/g,
      replacement: '[PHONE]'
    },
    {
      regex: /(\+?1\s?)?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{4}/g,
      replacement: '[PHONE]'
    },
    // Cédulas colombianas
    {
      regex: /\b\d{6,10}\b/g,
      replacement: '[ID_NUMBER]'
    },
    // Nombres comunes (lista básica)
    {
      regex: /\b(?:Juan|María|José|Ana|Carlos|Laura|Miguel|Carmen|David|Isabel|Antonio|Elena|Francisco|Pilar|Manuel|Dolores|José Antonio|María Carmen|José Luis|María Pilar|José Manuel|María Dolores|José María|María José|José Carlos|María Elena|José Miguel|María Isabel|José Francisco|María Teresa|José Antonio|María Ángeles|José Luis|María Carmen|José Manuel|María Dolores|José María|María José|José Carlos|María Elena|José Miguel|María Isabel|José Francisco|María Teresa|José Antonio|María Ángeles)\b/gi,
      replacement: '[NAME]'
    },
    // Direcciones (patrones básicos)
    {
      regex: /\b(?:Calle|Carrera|Avenida|Transversal|Diagonal)\s+\d+[A-Za-z]?\s*(?:#\s*\d+[A-Za-z]?)?/gi,
      replacement: '[ADDRESS]'
    },
    // Códigos postales
    {
      regex: /\b\d{5,6}\b/g,
      replacement: '[POSTAL_CODE]'
    },
    // URLs
    {
      regex: /https?:\/\/[^\s]+/g,
      replacement: '[URL]'
    },
    // Números de tarjeta (patrón básico)
    {
      regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      replacement: '[CARD_NUMBER]'
    }
  ];

  // Aplicar todos los patrones
  patterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern.regex, pattern.replacement);
  });

  // Limpiar espacios múltiples que puedan haber quedado
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Verifica si un texto contiene PII
 */
export function containsPII(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const piiPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails
    /(\+?57\s?)?[1-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}/, // Teléfonos colombianos
    /(\+?1\s?)?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{4}/, // Teléfonos US
    /\b\d{6,10}\b/, // Cédulas
    /https?:\/\/[^\s]+/, // URLs
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/ // Tarjetas
  ];

  return piiPatterns.some(pattern => pattern.test(text));
}

/**
 * Obtiene un preview sanitizado del texto (primeros 200 caracteres)
 */
export function getSanitizedPreview(text: string, maxLength: number = 200): string {
  const sanitized = sanitizePII(text);
  return sanitized.length > maxLength 
    ? sanitized.substring(0, maxLength) + '...' 
    : sanitized;
}
