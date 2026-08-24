/**
 * Roles disponibles dentro de Liquida.
 *
 * Los usuarios comunes pueden utilizar todas las funciones operativas.
 * El superusuario también administra las solicitudes de acceso.
 */
export enum UserRole {
  USER = 'user',
  SUPERUSER = 'superuser',
}
