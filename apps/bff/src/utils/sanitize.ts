/**
 * Sanitiza texto enmascarando información personal identificable (PII)
 * @param text - Texto a sanitizar
 * @returns Texto con PII enmascarado
 */
export function sanitizePII(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let sanitized = text;
  
  // Log de prueba en desarrollo para verificar sanitizado
  if (process.env.NODE_ENV === 'development' && containsPII(text)) {
    console.log('🔒 [PII] Texto original contiene PII, sanitizando...');
    console.log('🔒 [PII] Original:', text.substring(0, 100) + '...');
  }

  // Enmascarar emails
  sanitized = sanitized.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]');

  // Enmascarar teléfonos (formato colombiano e internacional)
  sanitized = sanitized.replace(/\b(\+?57\s?)?(\d{3}[\s\-]?\d{3}[\s\-]?\d{4})\b/g, '[PHONE]');
  sanitized = sanitized.replace(/\b(\+?\d{1,3}[\s\-]?)?(\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4})\b/g, '[PHONE]');

  // Enmascarar tarjetas de crédito
  sanitized = sanitized.replace(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, '[CARD]');

  // Enmascarar números de identificación colombianos
  sanitized = sanitized.replace(/\b\d{6,10}\b/g, '[ID_NUMBER]');

  // Enmascarar direcciones (patrones básicos)
  sanitized = sanitized.replace(/\b(Calle|Carrera|Avenida|Av\.?)\s+\d+[A-Z]?\s*#\s*\d+[A-Z]?/gi, '[ADDRESS]');

  // Enmascarar códigos postales
  sanitized = sanitized.replace(/\b\d{6}\b/g, '[POSTAL_CODE]');

  // Log de resultado en desarrollo
  if (process.env.NODE_ENV === 'development' && containsPII(text)) {
    console.log('🔒 [PII] Sanitizado:', sanitized.substring(0, 100) + '...');
    console.log('🔒 [PII] PII enmascarado correctamente ✅');
  }

  return sanitized;
}

/**
 * Verifica si un texto contiene PII
 * @param text - Texto a verificar
 * @returns true si contiene PII
 */
export function containsPII(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const piiPatterns = [
    /\b[\w.-]+@[\w.-]+\.\w+\b/, // emails
    /\b(\+?57\s?)?(\d{3}[\s\-]?\d{3}[\s\-]?\d{4})\b/, // teléfonos colombianos
    /\b(\+?\d{1,3}[\s\-]?)?(\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4})\b/, // teléfonos internacionales
    /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/, // tarjetas
    /\b\d{6,10}\b/ // IDs
  ];

  return piiPatterns.some(pattern => pattern.test(text));
}

/**
 * Obtiene estadísticas de sanitización
 * @param originalText - Texto original
 * @param sanitizedText - Texto sanitizado
 * @returns Estadísticas de sanitización
 */
export function getSanitizationStats(originalText: string, sanitizedText: string) {
  const originalLength = originalText.length;
  const sanitizedLength = sanitizedText.length;
  const maskedCount = (sanitizedText.match(/\[[A-Z_]+\]/g) || []).length;

  return {
    originalLength,
    sanitizedLength,
    maskedCount,
    reductionPercentage: originalLength > 0 ? ((originalLength - sanitizedLength) / originalLength) * 100 : 0
  };
}
