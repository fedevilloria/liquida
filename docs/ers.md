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

---

### RF15 – Consultar historial de liquidaciones

El sistema deberá permitir consultar el historial de liquidaciones registradas.

La consulta deberá admitir filtros opcionales por:

- Grupo.
- Banco.
- Fecha inicial.
- Fecha final.

Los filtros podrán utilizarse individualmente o combinarse entre sí.

---

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

---

## Estado de implementación

| Código | Funcionalidad | Estado |
|---------|---------------|--------|
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
| RF14 | Consultar historial de liquidaciones | Implementado |
| RF15 | Consultar historial de liquidaciones con filtros | Implementado |