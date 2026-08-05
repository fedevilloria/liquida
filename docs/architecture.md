# Arquitectura de Liquida

## 1. Visión general

Liquida utiliza una arquitectura web cliente-servidor.

```text
Angular
   │
   │ HTTP / JSON
   ▼
NestJS REST API
   │
   │ TypeORM
   ▼
PostgreSQL
```

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

- Angular 22
- Componentes standalone
- Angular Router con carga mediante `loadComponent`
- Signals para estado de interfaz
- Reactive Forms para formularios administrativos
- `provideHttpClient()` para comunicación con la API

El frontend se encuentra en desarrollo activo. El layout principal, el dashboard y las pantallas de gestión de grupos y bancos ya están implementados e integrados con la API.

---

## 3. Organización del backend

```text
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
```

### `groups`

Responsable de la administración de grupos.

Incluye:

- Entidad.
- DTO.
- Servicio.
- Controlador.
- Módulo.

### `banks`

Responsable de la administración de bancos y sus porcentajes de comisión.

### `commission-calculations`

Responsable de:

- Registrar liquidaciones.
- Calcular porcentajes e importes.
- Consultar liquidaciones.
- Filtrar el historial.
- Obtener estadísticas del dashboard.
- Obtener rankings de grupos y bancos.

Este módulo contiene la principal lógica de negocio de Liquida.

### `common`

Contiene elementos reutilizables por diferentes módulos.

Actualmente incluye:

- `BaseEntity`.
- Transformador para columnas numéricas de PostgreSQL.

### `config`

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
- Construcción de consultas dinámicas y agregadas.

### Repository

Es administrado por TypeORM y permite acceder a PostgreSQL.

### DTO

Define y valida los datos que pueden ingresar a través de la API.

También permite definir estructuras de respuesta desacopladas de las entidades persistentes.

### Entity

Representa la estructura persistente de una tabla de la base de datos.

---

## 5. Configuración

La conexión con PostgreSQL se construye de forma asíncrona utilizando:

- `ConfigModule`.
- `ConfigService`.
- `TypeOrmModule.forRootAsync()`.

Esto garantiza que las variables del archivo `.env` estén cargadas antes de intentar conectarse a la base de datos.

Las credenciales no se almacenan dentro del código fuente.

La configuración se valida al iniciar mediante `env.validation.ts`. Se controlan `NODE_ENV`, `PORT`, las variables `DB_*`, `FRONTEND_URL` y `SWAGGER_ENABLED`.

La sincronización automática del esquema se configura como `synchronize: !isProduction`: permanece disponible para desarrollo y pruebas, pero se desactiva en producción.

El origen permitido por CORS se obtiene desde `FRONTEND_URL`, cuyo valor local predeterminado es `http://localhost:4200`.

---

## 6. Entidad base

Las entidades principales heredan de `BaseEntity`.

Esta clase proporciona:

- `id`
- `createdAt`
- `updatedAt`

Esto evita duplicación y mantiene una estructura temporal consistente.

---

## 7. Borrado lógico

Los grupos y bancos utilizan el atributo `active`.

Cuando dejan de operar, se los marca como inactivos en lugar de eliminarlos físicamente.

Esto permite:

- Conservar el historial.
- Evitar relaciones inválidas.
- Reactivar registros posteriormente.

---

## 8. Manejo de decimales

PostgreSQL utiliza columnas `numeric` para almacenar porcentajes y montos.

Como PostgreSQL puede devolver estos valores como texto, Liquida utiliza un `ValueTransformer` para convertirlos en números de JavaScript.

En las consultas agregadas, los resultados de `COUNT`, `SUM` y `AVG` también se convierten explícitamente antes de construir la respuesta.

---

## 9. Estrategia de ramas

```text
main
└── develop
    ├── feature/database-config
    ├── feature/groups-crud
    ├── feature/banks-crud
    ├── feature/commission-calculations
    └── feature/commission-dashboard
```

### `main`

Contiene versiones estables.

### `develop`

Integra las funcionalidades terminadas.

### `feature/*`

Contiene el desarrollo aislado de cada funcionalidad.

---

## 10. Consulta dinámica del historial

El módulo de liquidaciones implementa consultas dinámicas utilizando `QueryBuilder` de TypeORM.

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

1. Estadísticas generales.
2. Grupo con mayor recaudación.
3. Banco utilizado en la mayor cantidad de liquidaciones.

Las consultas delegan los cálculos a PostgreSQL mediante:

- `COUNT`
- `SUM`
- `AVG`
- `COALESCE`
- `GROUP BY`
- `ORDER BY`

Esta estrategia evita cargar todas las liquidaciones en memoria y permite escalar mejor cuando aumente el volumen de datos.

Los filtros temporales se reutilizan mediante el método privado `applyDateFilters()`, que recibe un `SelectQueryBuilder<CommissionCalculation>` y el DTO de filtros.

---

## 12. Arquitectura del frontend

El frontend conserva la estructura generada por Angular 22 y utiliza componentes standalone.

### Layout y navegación

`MainLayout` actúa como contenedor de las páginas de la aplicación y adapta la navegación a distintos tamaños de pantalla.

Las páginas se resuelven mediante rutas lazy con `loadComponent`, evitando concentrar toda la interfaz en un único componente.

### Estado y comunicación HTTP

El estado de carga, error, mensajes de operación y selección de registros se maneja desde los componentes mediante signals.

La comunicación HTTP se habilita con `provideHttpClient()` y se encapsula en servicios del frontend. Entre los servicios existentes se encuentran los responsables de catálogos, liquidaciones y dashboard.

### Pantallas completadas

- Dashboard: métricas, filtro por fechas, estados de carga/error/sin resultados y adaptación responsive.
- Nueva liquidación: formulario integrado con los catálogos y el endpoint de registro de liquidaciones.
- Historial de liquidaciones: consulta del historial y consumo de filtros, paginación y ordenamiento provistos por la API.
- Grupos: alta, edición, listado, desactivación lógica, reactivación y validaciones de formulario.
- Bancos: alta, edición de nombre y porcentaje, listado, desactivación lógica, reactivación y validaciones de formulario.

Las pantallas administrativas reutilizan un mismo lenguaje visual: tarjetas, formularios, badges de estado, mensajes de éxito/error, confirmaciones para desactivación y adaptación de tablas a dispositivos móviles.

---

## 13. Documentación y ejecución por entorno

La API expone documentación OpenAPI mediante Swagger cuando `SWAGGER_ENABLED` está habilitado.

En desarrollo local se encuentra disponible en:

```text
http://localhost:3000/api/docs
```

La variable puede deshabilitar la documentación en entornos donde no deba exponerse.

---

## 14. Estrategia de pruebas

El backend utiliza pruebas unitarias aisladas mediante mocks de repositorios y `QueryBuilder`, además de una suite E2E para verificar el comportamiento HTTP.

Los comandos de verificación utilizados son:

```bash
npm run build
npm test
npm run test:e2e
```

Las pruebas no requieren modificar los datos productivos y la configuración de entorno distingue desarrollo, test y producción.
