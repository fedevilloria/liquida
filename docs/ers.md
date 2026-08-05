# Especificación de Requisitos de Software

## Liquida

## 1. Introducción

### 1.1 Propósito

Este documento define los requisitos funcionales y no funcionales de Liquida, un sistema destinado a gestionar grupos, bancos y liquidaciones de comisiones correspondientes a recaudaciones.

Liquida permitirá registrar los porcentajes de comisión cobrados por los bancos, seleccionar los grupos asociados a cada recaudación y calcular automáticamente la distribución de las comisiones entre el banco, el cliente y la organización.

---

### 1.2 Alcance

La primera versión de Liquida permitirá:

- Administrar grupos.
- Administrar bancos y sus porcentajes de comisión.
- Registrar liquidaciones individuales.
- Calcular automáticamente las comisiones.
- Conservar un historial de liquidaciones.
- Consultar el historial mediante filtros.
- Paginar y ordenar el historial de liquidaciones.
- Consultar un dashboard estadístico de liquidaciones.
- Filtrar el dashboard mediante un rango de fechas.
- Mantener los registros históricos aunque un grupo o banco deje de estar activo.
- Utilizar una interfaz web responsive para consultar el dashboard y administrar grupos y bancos.
- Mostrar estados de carga, error y ausencia de datos en las pantallas que consumen la API.

En versiones posteriores se podrá incorporar:

- Registro de múltiples liquidaciones en una misma operación.
- Exportación de información a Excel o PDF.
- Gestión de usuarios y roles.
- Auditoría de operaciones.

---

### 1.3 Definiciones

**Grupo:** conjunto o cliente asociado a una recaudación.

**Banco:** entidad o medio utilizado para recibir los ingresos y que cobra un porcentaje de comisión.

**Liquidación:** operación mediante la cual se distribuye la comisión total entre el banco, el cliente y la organización.

**Comisión total:** porcentaje total aplicado sobre el monto recaudado.

**Comisión bancaria:** porcentaje cobrado por el banco seleccionado.

**Comisión del cliente:** porcentaje opcional correspondiente al cliente.

**Comisión propia:** porcentaje restante correspondiente a la organización.

**Dashboard:** resumen estadístico construido a partir de las liquidaciones registradas.

**Historial paginado:** consulta del historial dividida en páginas, evitando devolver todos los registros en una única respuesta.

---

## 2. Descripción general

### 2.1 Perspectiva del producto

Liquida será una aplicación web compuesta por:

- Un frontend desarrollado con Angular.
- Una API REST desarrollada con NestJS.
- Una base de datos PostgreSQL.
- TypeORM como herramienta de persistencia.

---

### 2.2 Usuarios previstos

En su primera versión, el sistema será utilizado por operadores encargados de registrar grupos, bancos y liquidaciones de comisiones.

La autenticación y diferenciación de roles se incorporará en una versión posterior.

---

### 2.3 Interfaz web actual

El frontend utiliza Angular 22 y una estructura basada en componentes standalone.

La navegación principal se organiza mediante un layout responsive y rutas cargadas con `loadComponent`.

En el estado actual se encuentran implementadas e integradas con el backend las siguientes pantallas:

- Dashboard de liquidaciones, con filtro por rango de fechas.
- Registro de nuevas liquidaciones.
- Historial de liquidaciones.
- Gestión de grupos.
- Gestión de bancos y porcentajes de comisión.

Las pantallas de gestión de grupos y bancos permiten crear, editar, desactivar y reactivar registros sin abandonar la vista. La desactivación requiere confirmación y los registros inactivos permanecen visibles como parte del historial administrativo.

---

## 3. Requisitos funcionales

### RF01 — Registrar grupos

El sistema deberá permitir registrar un grupo indicando su nombre.

#### Reglas asociadas

- El nombre es obligatorio.
- El nombre no puede superar los 100 caracteres.
- No podrán existir dos grupos con el mismo nombre, aunque se utilicen diferentes mayúsculas o minúsculas.
- Todo grupo nuevo deberá registrarse inicialmente como activo.

---

### RF02 — Consultar grupos

El sistema deberá permitir:

- Consultar todos los grupos registrados.
- Consultar únicamente los grupos activos.
- Consultar un grupo por su identificador.

---

### RF03 — Modificar grupos

El sistema deberá permitir modificar el nombre de un grupo existente.

El nuevo nombre deberá cumplir las mismas validaciones aplicadas durante su creación.

---

### RF04 — Desactivar grupos

El sistema deberá permitir desactivar un grupo sin eliminar físicamente su información.

Los grupos inactivos no deberán aparecer en los desplegables utilizados para registrar nuevas liquidaciones.

---

### RF05 — Reactivar grupos

El sistema deberá permitir reactivar un grupo previamente desactivado.

La interfaz web deberá reflejar el estado activo o inactivo del grupo y ofrecer las acciones disponibles según dicho estado.

---

### RF06 — Registrar bancos

El sistema deberá permitir registrar un banco o medio de cobro indicando:

- Nombre.
- Porcentaje de comisión.

#### Reglas asociadas

- El nombre es obligatorio.
- El nombre no puede superar los 100 caracteres.
- El porcentaje no puede ser negativo.
- El porcentaje no puede superar el 100%.
- El porcentaje podrá contener hasta dos decimales.
- No podrán existir bancos duplicados por nombre.
- Todo banco nuevo deberá registrarse inicialmente como activo.

---

### RF07 — Consultar bancos

El sistema deberá permitir:

- Consultar todos los bancos.
- Consultar únicamente los bancos activos.
- Consultar un banco por su identificador.

---

### RF08 — Modificar bancos

El sistema deberá permitir modificar:

- El nombre del banco.
- Su porcentaje de comisión.

---

### RF09 — Desactivar bancos

El sistema deberá permitir desactivar un banco mediante borrado lógico.

Los bancos inactivos no deberán estar disponibles para nuevas liquidaciones.

---

### RF10 — Reactivar bancos

El sistema deberá permitir reactivar un banco previamente desactivado.

La interfaz web deberá mostrar el porcentaje de comisión configurado y el estado del banco. Un cambio del porcentaje deberá afectar únicamente a las nuevas liquidaciones.

---

### RF11 — Registrar una liquidación individual

El sistema deberá permitir registrar una liquidación indicando:

- Grupo.
- Banco.
- Monto recaudado.
- Porcentaje total de comisión.
- Porcentaje de comisión del cliente, cuando corresponda.
- Fecha y hora hasta la cual se consideran los comprobantes.
- Observaciones opcionales.

#### Reglas asociadas

- El grupo seleccionado deberá existir.
- El grupo seleccionado deberá encontrarse activo.
- El banco seleccionado deberá existir.
- El banco seleccionado deberá encontrarse activo.
- El monto recaudado deberá ser mayor que cero.
- La fecha y hora de liquidación deberá tener un formato válido.
- Las observaciones no podrán superar los 300 caracteres.

---

### RF12 — Calcular las comisiones

Al registrar una liquidación, el sistema deberá calcular automáticamente:

- Porcentaje correspondiente al banco.
- Porcentaje correspondiente al cliente.
- Porcentaje propio.
- Importe total de comisión.
- Importe correspondiente al banco.
- Importe correspondiente al cliente.
- Importe propio.

Los importes calculados deberán redondearse a dos decimales.

---

### RF13 — Conservar valores históricos

El sistema deberá guardar dentro de cada liquidación los porcentajes y montos utilizados.

Una modificación posterior del porcentaje de un banco no deberá alterar las liquidaciones ya registradas.

Cada liquidación deberá conservar:

- Porcentaje total.
- Porcentaje bancario.
- Porcentaje del cliente, cuando corresponda.
- Porcentaje propio.
- Importe total.
- Importe bancario.
- Importe del cliente, cuando corresponda.
- Importe propio.

---

### RF14 — Consultar historial de liquidaciones

El sistema deberá permitir consultar las liquidaciones registradas y visualizar:

- Grupo.
- Banco.
- Fecha y hora de liquidación.
- Monto recaudado.
- Porcentajes utilizados.
- Importes calculados.
- Observaciones.
- Fecha de creación del registro.

El historial deberá devolverse mediante páginas para evitar cargar todos los registros en una única respuesta.

---

### RF15 — Filtrar, paginar y ordenar el historial de liquidaciones

El sistema deberá permitir aplicar filtros opcionales por:

- Grupo.
- Banco.
- Fecha inicial.
- Fecha final.

Los filtros podrán utilizarse individualmente o combinarse entre sí.

La consulta deberá permitir indicar:

- Número de página.
- Cantidad de registros por página.
- Campo utilizado para ordenar.
- Dirección ascendente o descendente.

Cuando no se indiquen parámetros de paginación u ordenamiento, el sistema deberá utilizar:

- Página 1.
- Límite de 10 registros.
- Orden por fecha y hora de liquidación.
- Dirección descendente.

La respuesta deberá informar:

- Liquidaciones correspondientes a la página solicitada.
- Página actual.
- Cantidad máxima de registros por página.
- Cantidad total de registros que cumplen los filtros.
- Cantidad total de páginas.
- Si existe una página anterior.
- Si existe una página siguiente.

#### Reglas asociadas

- El número de página deberá ser mayor o igual a 1.
- El límite deberá ser un valor válido dentro del rango permitido.
- El campo de ordenamiento deberá pertenecer a los campos habilitados.
- La dirección de ordenamiento deberá ser `ASC` o `DESC`.
- La cantidad total de registros deberá considerar los filtros aplicados.
- Los filtros deberán poder combinarse con la paginación y el ordenamiento.
- La fecha inicial no podrá ser posterior a la fecha final.
- La fecha inicial deberá incluir el comienzo completo del día indicado.
- La fecha final deberá incluir el final completo del día indicado.

---

### RF16 — Consultar el dashboard de liquidaciones

El sistema deberá permitir consultar un resumen estadístico de las liquidaciones registradas.

El dashboard deberá informar:

- Cantidad total de liquidaciones.
- Recaudación total.
- Comisión total acumulada.
- Comisión bancaria acumulada.
- Comisión del cliente acumulada.
- Comisión propia acumulada.
- Recaudación promedio por liquidación.
- Grupo con mayor recaudación acumulada.
- Banco utilizado en la mayor cantidad de liquidaciones.

La consulta deberá aceptar filtros opcionales por:

- Fecha inicial.
- Fecha final.

Los filtros podrán utilizarse individualmente o en conjunto.

Cuando no existan liquidaciones para el período consultado:

- Los valores numéricos deberán ser cero.
- El grupo con mayor recaudación deberá devolverse como `null`.
- El banco más utilizado deberá devolverse como `null`.

#### Reglas asociadas

- La fecha inicial no podrá ser posterior a la fecha final.
- La fecha inicial deberá incluir el comienzo completo del día indicado.
- La fecha final deberá incluir el final completo del día indicado.
- Los resultados agregados deberán convertirse a valores numéricos antes de construir la respuesta.
- El grupo con mayor recaudación deberá determinarse mediante el monto total recaudado.
- El banco más utilizado deberá determinarse mediante la cantidad de liquidaciones asociadas.

---

## 4. Reglas de negocio

### RN01 — Cálculo del porcentaje propio

El porcentaje propio deberá obtenerse restando al porcentaje total:

- El porcentaje del banco.
- El porcentaje del cliente, cuando corresponda.

La fórmula será:

```text
ownCommissionPercentage =
totalCommissionPercentage
- bankCommissionPercentage
- clientCommissionPercentage
```

---

### RN02 — Comisión opcional del cliente

Cuando no se indique comisión del cliente:

- Su porcentaje deberá almacenarse como `null`.
- Su importe deberá almacenarse como `null`.
- Para realizar el cálculo del porcentaje propio deberá considerarse equivalente a cero.

---

### RN03 — Validación de porcentajes

La suma del porcentaje bancario y el porcentaje del cliente no podrá superar el porcentaje total de comisión.

Si la suma supera el porcentaje total, la liquidación no deberá registrarse.

---

### RN04 — Conservación del historial

Los grupos y bancos relacionados con liquidaciones no deberán eliminarse físicamente.

Los registros podrán desactivarse mediante borrado lógico, pero deberán conservarse para mantener la integridad del historial.

---

### RN05 — Banco seleccionado

El porcentaje bancario utilizado deberá corresponder al porcentaje configurado en el banco seleccionado al momento de registrar la liquidación.

El porcentaje deberá copiarse dentro de la liquidación para preservar su valor histórico.

---

### RN06 — Fecha y hora de corte

Cada liquidación deberá indicar la fecha y hora hasta la cual fueron considerados los comprobantes incluidos.

La fecha y hora de corte podrá ser diferente de la fecha de creación del registro.

---

### RN07 — Períodos de consulta

Cuando se indiquen una fecha inicial y una fecha final, la fecha inicial no podrá ser posterior a la fecha final.

Los filtros de fecha deberán incluir el día completo correspondiente a cada límite.

La fecha inicial deberá interpretarse desde:

```text
00:00:00.000
```

La fecha final deberá interpretarse hasta:

```text
23:59:59.999
```

---

### RN08 — Paginación del historial

El historial de liquidaciones deberá devolverse mediante páginas.

Cuando no se indiquen parámetros, se utilizará:

- Página 1.
- Límite de 10 registros.

El total de registros y páginas deberá calcularse considerando los filtros aplicados.

El desplazamiento deberá calcularse mediante:

```text
skip = (page - 1) × limit
```

La cantidad total de páginas deberá calcularse mediante:

```text
totalPages = Math.ceil(totalItems / limit)
```

---

### RN09 — Ordenamiento del historial

El historial solo podrá ordenarse mediante campos previamente habilitados por la aplicación.

La dirección de ordenamiento deberá ser:

- Ascendente.
- Descendente.

Por defecto, las liquidaciones se ordenarán desde la fecha de liquidación más reciente hacia la más antigua.

---

### RN10 — Persistencia de liquidaciones

Una liquidación deberá considerarse registrada únicamente después de haber sido persistida mediante el repositorio correspondiente.

La respuesta de la API deberá construirse a partir de la entidad persistida.

Esto permite devolver correctamente:

- Identificador autogenerado.
- Fecha de creación.
- Datos históricos almacenados.

---

### RN11 — Validación secuencial de dependencias

Durante el registro de una liquidación, el sistema deberá:

1. Buscar el grupo.
2. Validar que el grupo se encuentre activo.
3. Buscar el banco.
4. Validar que el banco se encuentre activo.
5. Realizar los cálculos.
6. Persistir la liquidación.

Si el grupo se encuentra inactivo, el banco no deberá consultarse.

---

## 5. Requisitos no funcionales

### RNF01 — Integridad de datos

La base de datos deberá impedir registros inválidos o relaciones inconsistentes.

Las relaciones entre liquidaciones, grupos y bancos deberán mantener integridad referencial.

---

### RNF02 — Validación de entradas

La API deberá validar los datos recibidos y devolver códigos HTTP apropiados ante errores.

Las validaciones deberán realizarse mediante DTOs y reglas de negocio en los servicios.

---

### RNF03 — Mantenibilidad

El código deberá utilizar nombres y estructuras en inglés, con comentarios explicativos en español.

La aplicación deberá mantener una organización modular por funcionalidad.

---

### RNF04 — Seguridad de configuración

Las credenciales de la base de datos deberán almacenarse mediante variables de entorno y no deberán incluirse en el repositorio.

---

### RNF05 — Precisión

Los porcentajes y montos deberán almacenarse utilizando tipos decimales adecuados, evitando tipos de punto flotante en PostgreSQL.

Los resultados monetarios deberán redondearse a dos decimales.

---

### RNF06 — Trazabilidad temporal

Las entidades principales deberán registrar automáticamente:

- Fecha de creación.
- Fecha de última modificación.

Las liquidaciones deberán registrar además su fecha y hora de corte.

---

### RNF07 — Reutilización de lógica

La lógica repetida de filtrado y consulta deberá centralizarse en métodos auxiliares cuando corresponda.

La lógica de transformación de entidades a DTOs deberá reutilizarse entre los distintos endpoints.

---

### RNF08 — Rendimiento del historial

La API no deberá devolver el historial completo en una única respuesta.

La paginación deberá limitar la cantidad de registros recuperados y transferidos en cada solicitud.

Las consultas deberán ejecutarse utilizando operaciones de base de datos como:

- `ORDER BY`.
- `OFFSET`.
- `LIMIT`.
- `COUNT`.

---

### RNF09 — Consistencia de las respuestas

La transformación de entidades persistentes a DTOs de respuesta deberá centralizarse para evitar duplicación e inconsistencias entre endpoints.

Los controladores no deberán realizar mapeos manuales de entidades.

---

### RNF10 — Pruebas unitarias

La lógica de negocio principal del backend deberá contar con pruebas unitarias automatizadas.

Las pruebas deberán:

- Ejecutarse sin requerir una conexión real con PostgreSQL.
- Reemplazar repositorios y servicios dependientes mediante mocks.
- Ser independientes entre sí.
- Poder ejecutarse repetidamente con el mismo resultado.
- Cubrir escenarios exitosos y escenarios de error.
- Verificar las principales reglas de negocio.
- Verificar la persistencia simulada.
- Verificar la transformación de entidades a DTOs.
- Verificar filtros, paginación y ordenamiento.
- Verificar las consultas estadísticas del dashboard.
- Verificar el comportamiento cuando no existen registros.
- Verificar la validación de rangos de fechas.

Los datos de prueba repetidos deberán construirse mediante fixtures reutilizables cuando corresponda.

Las consultas construidas con `QueryBuilder` deberán simularse mediante mocks encadenables.

La ejecución completa de las pruebas deberá realizarse mediante:

```bash
npm test
```

El proyecto deberá compilar correctamente mediante:

```bash
npm run build
```

---

### RNF11 — Aislamiento de pruebas

Las pruebas unitarias no deberán:

- Insertar datos reales.
- Modificar registros existentes.
- Depender del contenido actual de PostgreSQL.
- Requerir servicios externos.
- Depender del orden de ejecución de otras pruebas.

Cada prueba deberá configurar explícitamente sus propios datos y respuestas simuladas.

---

### RNF12 — Usabilidad y adaptación responsive

La interfaz deberá mantener una presentación utilizable en escritorio, tablet y dispositivos móviles.

Las tablas administrativas podrán transformarse en tarjetas en pantallas pequeñas, preservando la información y las acciones disponibles.

Los formularios deberán informar errores de validación, estados de guardado y resultados de las operaciones.

---

### RNF13 — Validación de configuración por entorno

La aplicación backend deberá validar las variables de entorno al iniciar.

La configuración deberá contemplar como mínimo:

- Entorno de ejecución.
- Puerto HTTP.
- Datos de conexión a PostgreSQL.
- Origen permitido para el frontend.
- Activación o desactivación de Swagger.

La sincronización automática del esquema mediante TypeORM no deberá utilizarse en producción.

---

### RNF14 — Pruebas de integración HTTP

Además de las pruebas unitarias, el backend deberá contar con pruebas E2E para verificar el comportamiento HTTP de los endpoints principales y sus validaciones.

---

## 6. Estado de implementación

### 6.1 Requisitos funcionales

| Código | Funcionalidad | Backend | Frontend |
|--------|---------------|---------|----------|
| RF01 | Registrar grupos | Implementado | Implementado |
| RF02 | Consultar grupos | Implementado | Implementado |
| RF03 | Modificar grupos | Implementado | Implementado |
| RF04 | Desactivar grupos | Implementado | Implementado |
| RF05 | Reactivar grupos | Implementado | Implementado |
| RF06 | Registrar bancos | Implementado | Implementado |
| RF07 | Consultar bancos | Implementado | Implementado |
| RF08 | Modificar bancos | Implementado | Implementado |
| RF09 | Desactivar bancos | Implementado | Implementado |
| RF10 | Reactivar bancos | Implementado | Implementado |
| RF11 | Registrar una liquidación | Implementado | Implementado |
| RF12 | Calcular automáticamente las comisiones | Implementado | Implementado mediante consumo de la API |
| RF13 | Conservar valores históricos | Implementado | No requiere lógica propia |
| RF14 | Consultar historial paginado de liquidaciones | Implementado | Implementado |
| RF15 | Filtrar, paginar y ordenar el historial | Implementado | Implementado |
| RF16 | Consultar dashboard de liquidaciones | Implementado | Implementado |

---

### 6.2 Requisitos no funcionales

| Código | Requisito | Estado |
|--------|-----------|--------|
| RNF01 | Integridad de datos | Implementado |
| RNF02 | Validación de entradas | Implementado |
| RNF03 | Mantenibilidad | Implementado |
| RNF04 | Seguridad de configuración | Implementado |
| RNF05 | Precisión | Implementado |
| RNF06 | Trazabilidad temporal | Implementado |
| RNF07 | Reutilización de lógica | Implementado |
| RNF08 | Rendimiento del historial | Implementado |
| RNF09 | Consistencia de las respuestas | Implementado |
| RNF10 | Pruebas unitarias automatizadas | Implementado |
| RNF11 | Aislamiento de pruebas | Implementado |
| RNF12 | Usabilidad y adaptación responsive | Implementado en pantallas finalizadas |
| RNF13 | Validación de configuración por entorno | Implementado |
| RNF14 | Pruebas de integración HTTP | Implementado |

---

## 7. Verificación actual

La implementación actual fue verificada mediante pruebas automatizadas y compilación del proyecto.

### Pruebas automatizadas

Resultado de la suite:

```text
Test Suites: 6 passed, 6 total
Tests:       27 passed, 27 total
Snapshots:   0 total
```

Las pruebas incluyen:

- Servicio de liquidaciones.
- Controlador de liquidaciones.
- Servicio de bancos.
- Controlador de bancos.
- Servicio de grupos.
- Controlador de grupos.

### Compilación

La compilación completa se verifica mediante:

```bash
npm run build
```

El proyecto compila correctamente sin errores.

### Pruebas E2E

La suite E2E se ejecuta mediante:

```bash
npm run test:e2e
```

La configuración de Jest para E2E fue corregida y la suite se ejecuta correctamente.

### Verificación manual del frontend

Se verificó en navegador:

- Carga y filtrado temporal del dashboard.
- Comportamiento responsive del dashboard.
- Creación, edición, desactivación y reactivación de grupos.
- Creación, edición, desactivación y reactivación de bancos.
- Actualización del porcentaje de comisión bancaria y utilización del nuevo valor en una liquidación posterior.
- Conservación del borrado lógico: desactivar un grupo o banco no elimina sus datos históricos.

---

## 8. Funcionalidades previstas para versiones posteriores

Las siguientes funcionalidades quedan fuera del alcance de la versión actual:

- Registro de múltiples liquidaciones en una única operación.
- Exportación del historial a Excel.
- Exportación del historial o dashboard a PDF.
- Autenticación de usuarios.
- Roles y permisos.
- Auditoría de operaciones.
- Registro de quién realizó cada liquidación.
- Notificaciones.
- Recuperación de contraseñas.
- Panel administrativo para usuarios.
