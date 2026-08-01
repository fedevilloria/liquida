import { ValueTransformer } from 'typeorm';

/**
 * Convierte los valores numeric de PostgreSQL en números de JavaScript.
 *
 * PostgreSQL devuelve estos campos como texto para preservar su precisión.
 * La transformación evita recibir valores como "0.80" cuando el sistema
 * necesita utilizarlos en operaciones matemáticas.
 */
export const numericTransformer: ValueTransformer = {
  // Conserva el número al enviarlo hacia PostgreSQL.
  to: (value: number | null): number | null => value,

  // Convierte el valor recibido desde PostgreSQL.
  from: (value: string | null): number | null =>
    value === null ? null : Number(value),
};
