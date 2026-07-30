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

## v0.3.0

### Agregado

- Paginación del historial de liquidaciones.
- Parámetro `page` para seleccionar la página solicitada.
- Parámetro `limit` para definir la cantidad de registros por página.
- Ordenamiento configurable mediante `sortBy`.
- Dirección de ordenamiento configurable mediante `sortOrder`.
- DTO específico para la respuesta paginada del historial.
- Metadatos con página actual, límite, cantidad total de registros y cantidad total de páginas.
- Indicadores para conocer si existe una página anterior o siguiente.

### Mejorado

- Compatibilidad entre filtros, paginación y ordenamiento.
- Reutilización del método `applyDateFilters()` en las consultas del historial y del dashboard.
- Centralización de la transformación de entidades mediante `CommissionCalculationResponseDto.fromEntity()`.
- Simplificación del controlador de liquidaciones.
- Eliminación del mapeo manual duplicado entre entidades y DTOs.
- Documentación de API, requisitos, arquitectura, base de datos y decisiones técnicas.

### Verificado

- Consulta de la primera página.
- Consulta de páginas posteriores.
- Modificación del límite de registros.
- Ordenamiento ascendente.
- Ordenamiento descendente.
- Ordenamiento por monto de recaudación.
- Consulta de liquidaciones por ID.
- Registro de nuevas liquidaciones.
- Compatibilidad entre paginación y filtros.

## v0.4.0

### Agregado

- Pruebas unitarias para `CommissionCalculationsService`.
- Pruebas de configuración para los controladores de liquidaciones, bancos y grupos.
- Pruebas de configuración para los servicios de bancos y grupos.
- Fixtures reutilizables para DTOs, grupos, bancos y liquidaciones.
- Mock reutilizable de `QueryBuilder` de TypeORM.
- Pruebas de registro de liquidaciones con y sin comisión del cliente.
- Pruebas para grupos y bancos inactivos.
- Pruebas para grupos, bancos y liquidaciones inexistentes.
- Pruebas para la validación de porcentajes.
- Pruebas para consultas por identificador.
- Pruebas para filtros por grupo, banco y fechas.
- Pruebas para combinación de filtros.
- Pruebas para paginación y ordenamiento.
- Pruebas para estadísticas y rankings del dashboard.
- Pruebas para el dashboard sin liquidaciones.
- Pruebas para períodos de consulta inválidos.

### Corregido

- Persistencia de nuevas liquidaciones mediante `Repository.save()`.
- Retorno de la entidad persistida antes de transformarla al DTO de respuesta.
- Orden de validación durante el registro de una liquidación.
- Configuración de dependencias en los archivos de prueba de bancos y grupos.

### Mejorado

- Validación del grupo antes de consultar el banco.
- Eliminación de consultas innecesarias cuando el grupo se encuentra inactivo.
- Organización del archivo `commission-calculations.service.spec.ts`.
- Reducción de código duplicado mediante fixtures reutilizables.
- Aislamiento de las pruebas respecto de PostgreSQL.
- Simulación de consultas encadenables de TypeORM.
- Cobertura de los principales caminos exitosos y de error del servicio de liquidaciones.

### Verificado

- 6 suites de pruebas aprobadas.
- 27 pruebas aprobadas.
- 0 pruebas fallidas.
- Compilación correcta mediante `npm run build`.
- Registro y persistencia real de liquidaciones mediante Postman.
- Cálculos correctos de comisión total, bancaria, del cliente y propia.