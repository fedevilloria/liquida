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

Los grupos y bancos utilizan el atributo:

active


Cuando dejan de operar, se los marca como inactivos en lugar de eliminarlos físicamente.

Esto permite:

- Conservar el historial.
- Evitar relaciones inválidas.
- Reactivar registros posteriormente.

---

## 8. Manejo de decimales

PostgreSQL utiliza columnas 'numeric' para almacenar porcentajes y montos.

Como PostgreSQL puede devolver estos valores como texto, Liquida utiliza un 'ValueTransformer' para convertirlos en números de JavaScript.

---

## 9. Estrategia de ramas

main
└── develop
    ├── feature/database-config
    ├── feature/groups-crud
    ├── feature/banks-crud
    └── feature/commission-calculations


### 'main'

Contiene versiones estables.

### 'develop'

Integra las funcionalidades terminadas.

### 'feature/*'

Contiene el desarrollo aislado de cada funcionalidad.