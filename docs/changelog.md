# Changelog

Todos los cambios importantes del proyecto se documentan en este archivo.

---

## v0.4.0

### Agregado

- Frontend Angular 22 con componentes standalone y rutas lazy mediante `loadComponent`.
- Layout principal responsive.
- Comunicación HTTP mediante `provideHttpClient()` y servicios por responsabilidad.
- Dashboard frontend integrado con el backend y filtro por rango de fechas.
- Estados de carga, error y ausencia de resultados en el dashboard.
- Pantalla para registrar nuevas liquidaciones integrada con la API.
- Pantalla de historial de liquidaciones con soporte para los filtros, paginación y ordenamiento del backend.
- Gestión completa de grupos desde el frontend: alta, edición, listado, desactivación lógica y reactivación.
- Gestión completa de bancos desde el frontend: alta, edición de nombre y porcentaje, listado, desactivación lógica y reactivación.
- Validaciones de formularios y mensajes de operación.
- Confirmaciones propias antes de desactivar grupos y bancos.
- Adaptación responsive de las pantallas administrativas.

### Verificado

- Integración frontend-backend del dashboard.
- Creación, edición, desactivación y reactivación de grupos.
- Creación, edición, desactivación y reactivación de bancos.
- Cambio del porcentaje de un banco y utilización del nuevo porcentaje en una liquidación posterior.
- Conservación de los registros históricos al utilizar borrado lógico.

---

## v0.3.0

### Agregado

- Paginación y ordenamiento configurables en el historial de liquidaciones.
- Metadatos de paginación en la respuesta del historial.
- Transformación centralizada de entidades a DTOs de respuesta en la capa de servicio.
- Swagger/OpenAPI disponible en `/api/docs` cuando está habilitado.
- Validación centralizada de variables de entorno.
- Archivo `.env.example` con la configuración necesaria para ejecutar el proyecto.
- Configuración de CORS mediante `FRONTEND_URL`.
- Variable `SWAGGER_ENABLED` para controlar la publicación de la documentación interactiva.
- Suite de pruebas E2E.

### Seguridad y configuración

- `synchronize` de TypeORM queda habilitado únicamente fuera de producción.
- Se distinguen los entornos `development`, `test` y `production`.

### Corregido

- Configuración de Jest para las pruebas E2E.
- Declaración duplicada de `app` en `test/app.e2e-spec.ts`, que impedía ejecutar la suite E2E.

### Verificado

- `npm run build`.
- `npm test`.
- `npm run test:e2e`.

---

## v0.2.0

### Agregado

- Dashboard de liquidaciones.
- Filtro del dashboard por fecha inicial y fecha final.
- Cantidad total de liquidaciones.
- Recaudación total.
- Comisión total acumulada.
- Comisión bancaria acumulada.
- Comisión del cliente acumulada.
- Comisión propia acumulada.
- Recaudación promedio por liquidación.
- Grupo con mayor recaudación acumulada.
- Banco utilizado en la mayor cantidad de liquidaciones.
- DTOs específicos para filtros y respuesta del dashboard.

### Mejorado

- Centralización de los filtros temporales mediante `applyDateFilters()`.
- Eliminación de lógica duplicada entre las consultas del dashboard.
- Ajustes de indentación y comentarios internos del servicio.
- Documentación de API, requisitos, arquitectura, modelo de datos y decisiones técnicas.

---

## v0.1.0

### Agregado

- Configuración inicial del proyecto.
- Conexión con PostgreSQL.
- Entidad base.
- CRUD completo de grupos.
- CRUD completo de bancos.
- Registro de liquidaciones.
- Cálculo automático de comisiones.
- DTOs de entrada y salida.
- Historial de liquidaciones.
- Filtros por grupo.
- Filtros por banco.
- Filtros por rango de fechas.
- Validación del período consultado.
- Implementación de consultas dinámicas mediante `QueryBuilder`.
