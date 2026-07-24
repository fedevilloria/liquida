# Changelog

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

### Agregado

- Historial de liquidaciones.
- Filtros por grupo.
- Filtros por banco.
- Filtros por rango de fechas.
- Validación del período consultado.
- Implementación de consultas dinámicas mediante QueryBuilder.

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

- Centralización de los filtros temporales mediante applyDateFilters().
- Eliminación de lógica duplicada entre las consultas del dashboard.
- Ajustes de indentación y comentarios internos del servicio.
- Documentación de API, requisitos, arquitectura, modelo de datos y decisiones técnicas.