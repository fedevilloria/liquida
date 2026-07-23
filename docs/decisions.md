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