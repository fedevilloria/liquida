# Registro de decisiones técnicas y funcionales

## DEC-001 — Nombre del sistema

**Estado:** Aceptada

**Decisión:** El sistema se denominará Liquida.

**Motivo:** Es un nombre breve, fácil de recordar y relacionado con la liquidación de comisiones y recaudaciones.

---

## DEC-002 — Tecnologías principales

**Estado:** Aceptada

**Decisión:** Utilizar Angular, NestJS, TypeORM y PostgreSQL.

**Motivo:**

- Permiten desarrollar una aplicación web estructurada.
- NestJS facilita una arquitectura modular.
- TypeORM permite mapear las entidades del dominio.
- PostgreSQL ofrece integridad y precisión para información financiera.

---

## DEC-003 — Código en inglés y comentarios en español

**Estado:** Aceptada

**Decisión:**

- Clases, variables, métodos, archivos, carpetas y endpoints se escribirán en inglés.
- Los comentarios y la documentación explicativa se escribirán en español.

**Motivo:** Mantener convenciones técnicas estándar sin perder claridad para el equipo actual.

---

## DEC-004 — Uso de una entidad base

**Estado:** Aceptada

**Decisión:** Las entidades principales heredarán de `BaseEntity`.

**Atributos compartidos:**

- `id`
- `createdAt`
- `updatedAt`

**Motivo:** Evitar duplicación y mantener consistencia entre entidades.

---

## DEC-005 — Variables de entorno

**Estado:** Aceptada

**Decisión:** Las credenciales de PostgreSQL se almacenarán en un archivo `.env`.

**Motivo:** Evitar exponer datos sensibles dentro del código y del repositorio.

---

## DEC-006 — Configuración asíncrona de PostgreSQL

**Estado:** Aceptada

**Decisión:** Utilizar `TypeOrmModule.forRootAsync()` y `ConfigService`.

**Motivo:** La configuración estática intentaba leer las variables antes de que `ConfigModule` cargara el archivo `.env`, provocando que la contraseña llegara como `undefined`.

---

## DEC-007 — Borrado lógico de grupos y bancos

**Estado:** Aceptada

**Decisión:** Los grupos y bancos se desactivarán mediante el atributo `active`.

**Alternativa descartada:** Eliminación física.

**Motivo:** Conservar el historial de liquidaciones y permitir la reactivación futura.

---

## DEC-008 — Comparación de nombres sin distinguir mayúsculas

**Estado:** Aceptada

**Decisión:** La aplicación validará nombres duplicados utilizando comparaciones insensibles a mayúsculas y minúsculas.

**Motivo:** Para el negocio, nombres como `Copter`, `COPTER` y `copter` representan el mismo banco.

---

## DEC-009 — Restricciones únicas en la base de datos

**Estado:** Aceptada

**Decisión:** Los nombres de grupos y bancos tendrán restricciones únicas en PostgreSQL.

**Motivo:** Agregar una segunda capa de protección además de las validaciones realizadas por los servicios.

---

## DEC-010 — Almacenamiento decimal

**Estado:** Aceptada

**Decisión:** Los porcentajes y montos se almacenarán mediante columnas PostgreSQL de tipo `numeric`.

**Alternativa descartada:** `float`.

**Motivo:** Los tipos de punto flotante pueden introducir imprecisiones en cálculos financieros.

---

## DEC-011 — Copia histórica de porcentajes

**Estado:** Aceptada

**Decisión:** Cada liquidación guardará los porcentajes utilizados en el momento del cálculo.

**Motivo:** Si el banco modifica su comisión posteriormente, las liquidaciones históricas deben conservar sus valores originales.

---

## DEC-012 — Almacenamiento de resultados calculados

**Estado:** Aceptada

**Decisión:** Cada liquidación guardará también los importes calculados.

**Motivo:**

- Evitar cambios históricos si la fórmula se modifica.
- Conservar exactamente el resultado obtenido en el momento de la liquidación.
- Facilitar consultas y reportes.

---

## DEC-013 — Comisión del cliente opcional

**Estado:** Aceptada

**Decisión:** El porcentaje y el importe correspondiente al cliente podrán ser nulos.

**Motivo:** No todos los grupos asignan una comisión adicional a un cliente.

---

## DEC-014 — Fecha y hora de corte

**Estado:** Aceptada

**Decisión:** Cada liquidación tendrá un atributo `calculationDateTime`.

**Motivo:** Permitir identificar hasta qué fecha y hora fueron considerados los comprobantes incluidos en la liquidación.

**Diferencia con `createdAt`:**

- `createdAt`: momento en que se guardó el registro.
- `calculationDateTime`: momento de corte de los comprobantes considerados.

---

## DEC-015 — Observaciones en las liquidaciones

**Estado:** Aceptada

**Decisión:** Las liquidaciones podrán incluir notas opcionales de hasta 300 caracteres.

**Motivo:** Facilitar aclaraciones y la interpretación posterior del historial.

---

## DEC-016 — Una liquidación por operación en la primera versión

**Estado:** Aceptada

**Decisión:** La primera versión registrará una liquidación individual por operación.

**Evolución prevista:** Permitir varias liquidaciones en una única operación.

**Motivo:** Validar primero la lógica individual y luego reutilizarla para operaciones múltiples.

---

## DEC-017 — Uso de DTO de respuesta

**Estado:** Aceptada

**Decisión**

La API no devolverá directamente las entidades persistentes.

En su lugar utilizará DTOs de respuesta específicos para cada caso de uso.

**Motivo**

- Reducir el acoplamiento entre la base de datos y la API.
- Evitar exponer información innecesaria.
- Facilitar futuras modificaciones del modelo sin afectar al frontend.
- Mantener respuestas más simples y fáciles de consumir.

**Resultado**

Se implementó `CommissionCalculationResponseDto` para representar las liquidaciones expuestas por la API.

---

## DEC-018 — Uso de QueryBuilder para consultas dinámicas

**Estado:** Aceptada

### Decisión

Las consultas que requieran filtros opcionales se implementarán utilizando `QueryBuilder` de TypeORM en lugar de `Repository.find()`.

### Motivo

- Permite construir consultas dinámicamente.
- Evita duplicar métodos para cada combinación de filtros.
- Facilita agregar nuevas condiciones en el futuro.
- Simplifica la incorporación de paginación, ordenamientos y reportes.

### Resultado

El historial de liquidaciones utiliza `QueryBuilder`, permitiendo filtrar por grupo, banco y rango de fechas mediante un único endpoint.

---

## DEC-019 - Consultas agregadas para el dashboard

**Estado:** Aceptada

### Decisión

El dashboard se implementará mediante consultas agregadas de PostgreSQL construidas con QueryBuilder.

Las consultas utilizarán funciones como:
- COUNT
- SUM
- AVG
- COALESCE
- GROUP BY
- ORDER BY

### Motivo

- Evitar cargar todas las liquidaciones en memoria.
- Delegar los cálculos estadísticos a la base de datos.
- Mejorar el rendimiento y la escalabilidad.
- Obtener totales, promedios y rankings mediante consultas específicas.

### Resultado

El endpoint del dashboard devuelve estadísticas generales, el grupo con mayor recaudación y el banco más utilizado.

---

## DEC-020 - Reutilización de filtros temporales

**Estado:** Aceptada

### Decisión

La aplicación centralizará la aplicación de filtros de fecha del dashboard en el método privado applyDateFilters().

### Motivo

- Evitar duplicación entre las consultas generales, el ranking de grupos y el ranking de bancos.
- Mantener una única definición del rango temporal.
- Reducir el riesgo de inconsistencias al modificar la lógica.

### Resultado

Las tres consultas del dashboard reutilizan el mismo método auxiliar.

---

## DEC-021 — Paginación y ordenamiento del historial

**Estado:** Aceptada

### Decisión

El historial de liquidaciones utilizará paginación basada en número de página y cantidad de registros por página.

La consulta permitirá configurar:

- Página solicitada.
- Cantidad de registros por página.
- Campo de ordenamiento.
- Dirección ascendente o descendente.

Los campos habilitados para ordenar estarán definidos explícitamente mediante un enum.

### Motivo

- Evitar devolver todas las liquidaciones en una única respuesta.
- Reducir el tamaño de las respuestas HTTP.
- Facilitar la implementación de tablas paginadas en el frontend.
- Mantener un rendimiento adecuado cuando aumente el historial.
- Evitar que el usuario pueda ordenar por campos no permitidos.
- Permitir combinar ordenamiento, filtros y paginación.

### Valores predeterminados

Cuando el usuario no indique parámetros, se utilizarán:

- Página 1.
- Límite de 10 registros.
- Orden por fecha y hora de liquidación.
- Dirección descendente.

### Implementación

La consulta utiliza:

- `skip()` para calcular el desplazamiento.
- `take()` para limitar los resultados.
- `orderBy()` para ordenar.
- `getManyAndCount()` para obtener los registros y el total.

La respuesta incluye:

- Liquidaciones de la página solicitada.
- Página actual.
- Límite aplicado.
- Cantidad total de registros.
- Cantidad total de páginas.
- Existencia de página anterior.
- Existencia de página siguiente.

### Alternativas descartadas

- Devolver todo el historial sin paginación.
- Permitir cualquier campo recibido desde la solicitud como criterio de ordenamiento.
- Implementar paginación por cursor en esta primera versión.

### Resultado

El endpoint `GET /commission-calculations` permite consultar el historial mediante filtros, paginación y ordenamiento.

---

## DEC-022 — Transformación de liquidaciones en la capa de servicio

**Estado:** Aceptada

### Decisión

La transformación de entidades `CommissionCalculation` a `CommissionCalculationResponseDto` se realizará en la capa de servicio.

La transformación utilizará:


CommissionCalculationResponseDto.fromEntity()


### Motivo

- Centralizar el formato de las respuestas.
- Evitar repetir el mapeo de propiedades.
- Mantener controladores simples.
- Evitar devolver directamente entidades persistentes.
- Facilitar futuras modificaciones del DTO.
- Reducir inconsistencias entre endpoints.

### Resultado

Los siguientes métodos devuelven DTOs de respuesta desde el servicio:

- Registro de una liquidación.
- Consulta de una liquidación por ID.
- Consulta paginada del historial.

Los controladores delegan la operación al servicio y devuelven directamente el resultado.

---

## DEC-023 — Estrategia de pruebas unitarias

**Estado:** Aceptada

### Decisión

Los servicios y controladores del backend serán probados mediante pruebas unitarias ejecutadas con Jest y las herramientas de testing de NestJS.

Las pruebas reemplazarán las dependencias externas mediante mocks, evitando utilizar una conexión real con PostgreSQL.

Se utilizarán mocks para:

- Repositorios de TypeORM.
- Servicios dependientes.
- Métodos de persistencia.
- Métodos de consulta.
- `QueryBuilder`.

Los datos repetidos de prueba se construirán mediante fixtures reutilizables.

### Motivo

- Mantener las pruebas aisladas de la base de datos.
- Evitar modificaciones sobre datos reales.
- Permitir una ejecución rápida y repetible.
- Probar cada unidad de forma independiente.
- Simular escenarios exitosos y de error de manera controlada.
- Facilitar la detección de regresiones.
- Reducir la duplicación dentro de los archivos de prueba.
- Verificar reglas de negocio sin depender de Postman ni de servicios externos.

### Implementación

El servicio de liquidaciones utiliza fixtures reutilizables para construir:

- DTOs de registro.
- Grupos.
- Bancos.
- Liquidaciones.

Las consultas construidas con TypeORM se prueban mediante un mock encadenable de `QueryBuilder`.

Los métodos de construcción del mock utilizan `mockReturnThis()` para permitir llamadas como:

```ts
query
  .leftJoinAndSelect(...)
  .andWhere(...)
  .orderBy(...)
  .skip(...)
  .take(...)
  .getManyAndCount();
```

---

## DEC-024 — Documentación interactiva mediante OpenAPI

**Estado:** Aceptada

### Decisión

Documentar la API mediante Swagger y OpenAPI 3, incluyendo operaciones, parámetros, DTOs, ejemplos de solicitud y respuesta, y códigos HTTP.

La interfaz estará disponible en `/api/docs` cuando `SWAGGER_ENABLED=true`.

### Motivo

- Mantener un contrato visible y actualizado para el frontend.
- Facilitar las pruebas manuales de los endpoints.
- Reducir ambigüedades sobre parámetros, validaciones y respuestas.
- Permitir deshabilitar la documentación en entornos donde no deba exponerse.

---

## DEC-025 — Validación centralizada de variables de entorno

**Estado:** Aceptada

### Decisión

Validar y tipar la configuración al iniciar la aplicación. El repositorio incluirá `.env.example` como referencia, mientras que los archivos `.env` con valores reales permanecerán excluidos del control de versiones.

### Motivo

- Detectar configuraciones incompletas antes de aceptar solicitudes.
- Evitar conversiones dispersas de cadenas a números o booleanos.
- Documentar las variables requeridas sin publicar credenciales.
- Mantener un comportamiento consistente entre desarrollo, pruebas y producción.

---

## DEC-026 — Configuración dependiente del entorno

**Estado:** Aceptada

### Decisión

- Obtener el puerto HTTP desde `PORT`.
- Obtener el origen permitido por CORS desde `FRONTEND_URL`.
- Habilitar Swagger mediante `SWAGGER_ENABLED`.
- Mantener `synchronize` de TypeORM desactivado en producción.

### Motivo

- Evitar valores de infraestructura fijados en el código.
- Permitir que Angular consuma la API desde un origen configurable.
- Reducir el riesgo de cambios automáticos del esquema en producción.
- Adaptar las capacidades de diagnóstico y documentación a cada entorno.

---

## DEC-027 — Pruebas HTTP End-to-End

**Estado:** Aceptada

### Decisión

Complementar las pruebas unitarias con pruebas E2E ejecutadas mediante Jest y Supertest sobre una instancia HTTP de NestJS.

### Motivo

- Verificar rutas, serialización, validaciones globales y códigos HTTP.
- Detectar diferencias entre el comportamiento interno de los servicios y el contrato expuesto.
- Probar errores de validación, como páginas inválidas o propiedades desconocidas.

### Resultado

La versión actual cuenta con 6 pruebas E2E aprobadas y mantiene separadas las responsabilidades de las pruebas unitarias y HTTP.