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
    ├── feature/commission-dashboard
    └── feature/commission-history-pagination


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

Actualmente el historial admite filtros por:

- Grupo.
- Banco.
- Fecha inicial.
- Fecha final.

También permite:

- Seleccionar el número de página.
- Seleccionar la cantidad de registros por página.
- Ordenar por campos habilitados.
- Seleccionar orden ascendente o descendente.
- Combinar filtros, paginación y ordenamiento.

La consulta se ejecuta mediante `getManyAndCount()`.

Este método permite obtener:

- Las liquidaciones correspondientes a la página solicitada.
- La cantidad total de liquidaciones que cumplen los filtros.

La paginación utiliza:

- `skip()` para establecer la cantidad de registros omitidos.
- `take()` para limitar la cantidad de registros devueltos.
- `orderBy()` para aplicar el orden solicitado.

El desplazamiento se calcula mediante:


skip = (page - 1) × limit


La cantidad total de páginas se calcula mediante:


totalPages = Math.ceil(totalItems / limit)


La respuesta incluye las liquidaciones y los siguientes metadatos:

- Página actual.
- Límite aplicado.
- Cantidad total de registros.
- Cantidad total de páginas.
- Existencia de una página anterior.
- Existencia de una página siguiente.

Por defecto, la consulta utiliza:

- Página 1.
- Límite de 10 registros.
- Orden por `calculationDateTime`.
- Dirección descendente.

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

---

## 12. Transformación de entidades a DTO

Las entidades de liquidaciones no se devuelven directamente desde la API.

El servicio transforma las entidades mediante:


CommissionCalculationResponseDto.fromEntity()


Esta transformación se utiliza en:

- Registro de una liquidación.
- Consulta de una liquidación por ID.
- Consulta paginada del historial.

La transformación se realiza en la capa de servicio.

El controlador se limita a:

- Recibir la solicitud HTTP.
- Validar los parámetros mediante DTOs.
- Delegar la operación al servicio.
- Devolver el resultado.

El flujo general es:


Solicitud HTTP
   │
   ▼
Controller
   │
   ▼
DTO de entrada o filtros
   │
   ▼
CommissionCalculationsService
   │
   ▼
Repository / QueryBuilder
   │
   ▼
PostgreSQL
   │
   ▼
Entidad
   │
   ▼
CommissionCalculationResponseDto
   │
   ▼
Respuesta JSON


Esta decisión permite:

- Mantener controladores más simples.
- Evitar duplicación de código.
- Centralizar el formato de las respuestas.
- Reducir el acoplamiento entre las entidades y la API.

---

## 13. Estrategia de pruebas unitarias

El backend utiliza Jest y las herramientas de testing de NestJS para verificar el comportamiento de los servicios y controladores.

Las pruebas unitarias se ejecutan sin conectarse a PostgreSQL.

Para aislar cada unidad se reemplazan las dependencias externas mediante mocks:

- Repositorios de TypeORM.
- Servicios utilizados por otros módulos.
- `QueryBuilder`.
- Métodos de persistencia y consulta.

### Pruebas del servicio de liquidaciones

`CommissionCalculationsService` cuenta con pruebas unitarias para sus principales métodos públicos:

- `registerCalculation()`.
- `findOne()`.
- `findAll()`.
- `getDashboard()`.

Las pruebas cubren:

- Registro correcto de liquidaciones.
- Cálculo de porcentajes e importes.
- Liquidaciones con y sin comisión del cliente.
- Grupos y bancos inactivos.
- Grupos, bancos y liquidaciones inexistentes.
- Validación de la suma de porcentajes.
- Persistencia mediante `create()` y `save()`.
- Transformación de entidades a DTO.
- Filtros por grupo y banco.
- Combinación de filtros.
- Filtros por rango de fechas.
- Validación de períodos.
- Paginación.
- Ordenamiento.
- Estadísticas generales del dashboard.
- Dashboard sin registros.
- Rankings de grupos y bancos.

### Fixtures reutilizables

Los datos de prueba repetidos se construyen mediante funciones auxiliares:

- `createRegisterDto()`.
- `createGroup()`.
- `createBank()`.
- `createCalculation()`.

Cada función genera un objeto válido con valores predeterminados y permite reemplazar únicamente las propiedades necesarias para cada escenario.

Ejemplo:

```ts
const inactiveGroup = createGroup({
  active: false,
});