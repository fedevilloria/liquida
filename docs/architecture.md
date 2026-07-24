# Arquitectura de Liquida

## 1. Visión general

Liquida utiliza una arquitectura web cliente-servidor.

Angular
   │
   │ HTTP / JSON
   ▼
NestJS REST API
   │
   │ TypeORM
   ▼
PostgreSQL


La aplicación está dividida en:

- Frontend: interfaz utilizada por el operador.
- Backend: reglas de negocio, validaciones y acceso a datos.
- Base de datos: almacenamiento persistente de la información.

---

## 2. Tecnologías

### Backend

- Node.js
- NestJS
- TypeScript
- TypeORM
- class-validator
- class-transformer

### Base de datos

- PostgreSQL 18
- pgAdmin

### Frontend

- Angular

El frontend será incorporado cuando los principales casos de uso del backend estén funcionando correctamente.

---

## 3. Organización del backend

backend/
├── src/
│   ├── banks/
│   ├── commission-calculations/
│   ├── common/
│   │   ├── entities/
│   │   └── transformers/
│   ├── config/
│   ├── groups/
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env
└── package.json


### 'groups'

Responsable de la administración de grupos.

Incluye:

- Entidad.
- DTO.
- Servicio.
- Controlador.
- Módulo.

### 'banks'

Responsable de la administración de bancos y sus porcentajes de comisión.

### 'commission-calculations'

Responsable del registro, cálculo y consulta de las liquidaciones.

Este módulo contiene la principal lógica de negocio de Liquida.

### 'common'

Contiene elementos reutilizables por diferentes módulos.

Actualmente incluye:

- 'BaseEntity'.
- Transformador para columnas numéricas de PostgreSQL.

### 'config'

Contiene las configuraciones externas de la aplicación.

Actualmente incluye:

- Configuración de conexión a PostgreSQL.

---

## 4. Separación de responsabilidades

### Controller

Recibe solicitudes HTTP y delega la operación al servicio correspondiente.

No debe contener lógica compleja de negocio.

### Service

Contiene:

- Reglas de negocio.
- Validaciones.
- Coordinación entre repositorios y módulos.
- Persistencia de entidades.

### Repository

Es administrado por TypeORM y permite acceder a PostgreSQL.

### DTO

Define y valida los datos que pueden ingresar a través de la API.

### Entity

Representa la estructura persistente de una tabla de la base de datos.

---

## 5. Configuración

La conexión con PostgreSQL se construye de forma asíncrona utilizando:

- 'ConfigModule'.
- 'ConfigService'.
- 'TypeOrmModule.forRootAsync()'.

Esto garantiza que las variables del archivo '.env' estén cargadas antes de intentar conectarse a la base de datos.

Las credenciales no se almacenan dentro del código fuente.

---

## 6. Entidad base

Las entidades principales heredan de 'BaseEntity'.

Esta clase proporciona:

- 'id'
- 'createdAt'
- 'updatedAt'

Esto evita duplicación y mantiene una estructura temporal consistente.

---

## 7. Borrado lógico

Los grupos y bancos utilizan el atributo: active

Cuando dejan de operar, se los marca como inactivos en lugar de eliminarlos físicamente.

Esto permite:

- Conservar el historial.
- Evitar relaciones inválidas.
- Reactivar registros posteriormente.

---

## 8. Manejo de decimales

PostgreSQL utiliza columnas 'numeric' para almacenar porcentajes y montos.

Como PostgreSQL puede devolver estos valores como texto, Liquida utiliza un 'ValueTransformer' para convertirlos en números de JavaScript.

En las consultas agregadas, los resultados de COUNT, SUM y AVG también se convierten explícitamente antes de construir la respuesta.

---

## 9. Estrategia de ramas

main
└── develop
    ├── feature/database-config
    ├── feature/groups-crud
    ├── feature/banks-crud
    ├── feature/commission-calculations
    └── feature/commission-dashboard


### 'main'

Contiene versiones estables.

### 'develop'

Integra las funcionalidades terminadas.

### 'feature/*'

Contiene el desarrollo aislado de cada funcionalidad.

---

## 10. Consulta dinámica del historial

El módulo de liquidaciones implementa consultas dinámicas utilizando QueryBuilder de TypeORM.

Esta estrategia permite construir la consulta SQL únicamente con los filtros enviados por el usuario, evitando la creación de múltiples métodos específicos para cada combinación de criterios.

Actualmente el historial admite:

- Grupo.
- Banco.
- Fecha inicial.
- Fecha final.

La consulta devuelve los resultados ordenados desde la liquidación más reciente hacia la más antigua.

---

## 11. Dashboard de liquidaciones

El dashboard se implementa mediante tres consultas agregadas independientes:

1- Estadísticas generales.
2- Grupo con mayor recaudación.
3- Banco utilizado en la mayor cantidad de liquidaciones.

Las consultas delegan los cálculos a PostgreSQL mediante:

- COUNT
- SUM
- AVG
- COALESCE
- GROUP BY
- ORDER BY

Esta estrategia evita cargar todas las liquidaciones en memoria y permite escalar mejor cuando aumente el volumen de datos.

Los filtros temporales se reutilizan mediante el método privado applyDateFilters(), que recibe un SelectQueryBuilder<CommissionCalculation> y el DTO de filtros.