import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Función utilitaria para combinar clases CSS de manera condicional
 * Combina clsx y tailwind-merge para un manejo óptimo de clases
 * 
 * @param inputs - Clases CSS a combinar
 * @returns String con las clases combinadas
 * 
 * @example
 * ```tsx
 * cn('base-class', condition && 'conditional-class', 'another-class')
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
