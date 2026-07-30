# Especificación de Requisitos de Software

## Liquida

### 1. Introducción

#### 1.1 Propósito

Este documento define los requisitos funcionales y no funcionales de Liquida, un sistema destinado a gestionar grupos, bancos y liquidaciones de comisiones correspondientes a recaudaciones.

Liquida permitirá registrar los porcentajes de comisión cobrados por los bancos, seleccionar los grupos asociados a cada recaudación y calcular automáticamente la distribución de las comisiones entre el banco, el cliente y la organización.

#### 1.2 Alcance

La primera versión de Liquida permitirá:

- Administrar grupos.
- Administrar bancos y sus porcentajes de comisión.
- Registrar liquidaciones individuales.
- Calcular automáticamente las comisiones.
- Conservar un historial de liquidaciones.
- Mantener los registros históricos aunque un grupo o banco deje de estar activo.

En versiones posteriores se podrá incorporar:

- Registro de múltiples liquidaciones en una misma operación.
- Exportación de información a Excel o PDF.
- Estadísticas y paneles de control.
- Gestión de usuarios y roles.
- Auditoría de operaciones.

#### 1.3 Definiciones

**Grupo:** conjunto o cliente asociado a una recaudación.

**Banco:** entidad o medio utilizado para recibir los ingresos y que cobra un porcentaje de comisión.

**Liquidación:** operación mediante la cual se distribuye la comisión total entre el banco, el cliente y la organización.

**Comisión total:** porcentaje total aplicado sobre el monto recaudado.

**Comisión bancaria:** porcentaje cobrado por el banco seleccionado.

**Comisión del cliente:** porcentaje opcional correspondiente al cliente.

**Comisión propia:** porcentaje restante correspondiente a la organización.

---

## 2. Descripción general

### 2.1 Perspectiva del producto

Liquida será una aplicación web compuesta por:

- Un frontend desarrollado con Angular.
- Una API REST desarrollada con NestJS.
- Una base de datos PostgreSQL.
- TypeORM como herramienta de persistencia.

### 2.2 Usuarios previstos

En su primera versión, el sistema será utilizado por operadores encargados de registrar grupos, bancos y liquidaciones de comisiones.

La autenticación y diferenciación de roles se incorporará en una versión posterior.

---

## 3. Requisitos funcionales

### RF01 — Registrar grupos

El sistema deberá permitir registrar un grupo indicando su nombre.

#### Reglas asociadas

- El nombre es obligatorio.
- El nombre no puede superar los 100 caracteres.
- No podrán existir dos grupos con el mismo nombre, aunque se utilicen diferentes mayúsculas o minúsculas.
- Todo grupo nuevo deberá registrarse inicialmente como activo.

### RF02 — Consultar grupos

El sistema deberá permitir:

- Consultar todos los grupos registrados.
- Consultar únicamente los grupos activos.
- Consultar un grupo por su identificador.

### RF03 — Modificar grupos

El sistema deberá permitir modificar el nombre de un grupo existente.

El nuevo nombre deberá cumplir las mismas validaciones aplicadas durante su creación.

### RF04 — Desactivar grupos

El sistema deberá permitir desactivar un grupo sin eliminar físicamente su información.

Los grupos inactivos no deberán aparecer en los desplegables utilizados para registrar nuevas liquidaciones.

### RF05 — Reactivar grupos

El sistema deberá permitir reactivar un grupo previamente desactivado.

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

### RF07 — Consultar bancos

El sistema deberá permitir:

- Consultar todos los bancos.
- Consultar únicamente los bancos activos.
- Consultar un banco por su identificador.

### RF08 — Modificar bancos

El sistema deberá permitir modificar:

- El nombre del banco.
- Su porcentaje de comisión.

### RF09 — Desactivar bancos

El sistema deberá permitir desactivar un banco mediante borrado lógico.

Los bancos inactivos no deberán estar disponibles para nuevas liquidaciones.

### RF10 — Reactivar bancos

El sistema deberá permitir reactivar un banco previamente desactivado.

### RF11 — Registrar una liquidación individual

El sistema deberá permitir registrar una liquidación indicando:

- Grupo.
- Banco.
- Monto recaudado.
- Porcentaje total de comisión.
- Porcentaje de comisión del cliente, cuando corresponda.
- Fecha y hora hasta la cual se consideran los comprobantes.
- Observaciones opcionales.

### RF12 — Calcular las comisiones

Al registrar una liquidación, el sistema deberá calcular automáticamente:

- Porcentaje correspondiente al banco.
- Porcentaje correspondiente al cliente.
- Porcentaje propio.
- Importe total de comisión.
- Importe correspondiente al banco.
- Importe correspondiente al cliente.
- Importe propio.

### RF13 — Conservar valores históricos

El sistema deberá guardar dentro de cada liquidación los porcentajes y montos utilizados.

Una modificación posterior del porcentaje de un banco no deberá alterar las liquidaciones ya registradas.

### RF14 — Consultar historial de liquidaciones

El sistema deberá permitir consultar las liquidaciones registradas y visualizar:

- Grupo.
- Banco.
- Fecha y hora de liquidación.
- Monto recaudado.
- Porcentajes utilizados.
- Importes calculados.
- Observaciones.

El historial deberá devolverse mediante páginas para evitar cargar todos los registros en una única respuesta.

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

### RF16 - Consultar el dashboard de liquidaciones

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

La consulta deberá aceptar filtros opcionales por fecha inicial y fecha final.

Cuando no existan liquidaciones para el período consultado, los valores numéricos deberán ser cero y los rankings deberán devolverse como nulos.

## 4. Reglas de negocio

### RN01 — Cálculo del porcentaje propio

El porcentaje propio deberá obtenerse restando al porcentaje total:

- El porcentaje del banco.
- El porcentaje del cliente, cuando corresponda.

### RN02 — Comisión opcional del cliente

Cuando no se indique comisión del cliente, su porcentaje e importe deberán considerarse nulos o equivalentes a cero para el cálculo.

### RN03 — Validación de porcentajes

La suma del porcentaje bancario y el porcentaje del cliente no podrá superar el porcentaje total de comisión.

### RN04 — Conservación del historial

Los grupos y bancos relacionados con liquidaciones no deberán eliminarse físicamente.

### RN05 — Banco seleccionado

El porcentaje bancario utilizado deberá corresponder al porcentaje configurado en el banco seleccionado al momento de registrar la liquidación.

### RN06 — Fecha y hora de corte

Cada liquidación deberá indicar la fecha y hora hasta la cual fueron considerados los comprobantes incluidos.

### RN07 - Períodos de consulta

Cuando se indiquen una fecha inicial y una fecha final, la fecha inicial no podrá ser posterior a la fecha final.

Los filtros de fecha deberán incluir el día completo correspondiente a cada límite.

### RN08 — Paginación del historial

El historial de liquidaciones deberá devolverse mediante páginas.

Cuando no se indiquen parámetros, se utilizará la página 1 y un límite de 10 registros.

El total de registros y páginas deberá calcularse considerando los filtros aplicados.

### RN09 — Ordenamiento del historial

El historial solo podrá ordenarse mediante campos previamente habilitados por la aplicación.

La dirección de ordenamiento deberá ser ascendente o descendente.

Por defecto, las liquidaciones se ordenarán desde la fecha de liquidación más reciente hacia la más antigua.

---

## 5. Requisitos no funcionales

### RNF01 — Integridad de datos

La base de datos deberá impedir registros inválidos o relaciones inconsistentes.

### RNF02 — Validación de entradas

La API deberá validar los datos recibidos y devolver códigos HTTP apropiados ante errores.

### RNF03 — Mantenibilidad

El código deberá utilizar nombres y estructuras en inglés, con comentarios explicativos en español.

### RNF04 — Seguridad de configuración

Las credenciales de la base de datos deberán almacenarse mediante variables de entorno y no deberán incluirse en el repositorio.

### RNF05 — Precisión

Los porcentajes y montos deberán almacenarse utilizando tipos decimales adecuados, evitando tipos de punto flotante en PostgreSQL.

### RNF06 — Trazabilidad temporal

Las entidades principales deberán registrar automáticamente su fecha de creación y última modificación.

### RNF07 - Reutilización de lógica

La lógica repetida de filtrado y consulta deberá centralizarse en métodos auxiliares cuando corresponda, para mejorar la mantenibilidad.

### RNF08 — Rendimiento del historial

La API no deberá devolver el historial completo en una única respuesta.

La paginación deberá limitar la cantidad de registros recuperados y transferidos en cada solicitud.

### RNF09 — Consistencia de las respuestas

La transformación de entidades persistentes a DTOs de respuesta deberá centralizarse para evitar duplicación e inconsistencias entre endpoints.

---

## Estado de implementación

| Código | Funcionalidad | Estado |
|--------|---------------|--------|
| RF01 | Registrar grupos | Implementado |
| RF02 | Consultar grupos | Implementado |
| RF03 | Modificar grupos | Implementado |
| RF04 | Desactivar grupos | Implementado |
| RF05 | Reactivar grupos | Implementado |
| RF06 | Registrar bancos | Implementado |
| RF07 | Consultar bancos | Implementado |
| RF08 | Modificar bancos | Implementado |
| RF09 | Desactivar bancos | Implementado |
| RF10 | Reactivar bancos | Implementado |
| RF11 | Registrar una liquidación | Implementado |
| RF12 | Calcular automáticamente las comisiones | Implementado |
| RF13 | Conservar valores históricos | Implementado |
| RF14 | Consultar historial paginado de liquidaciones | Implementado |
| RF15 | Filtrar, paginar y ordenar el historial | Implementado |
| RF16 | Consultar dashboard de liquidaciones | Implementado |