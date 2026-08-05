# API REST

## Información general

### URL local

```text
http://localhost:3000
```

### Formato

Las solicitudes y respuestas utilizan JSON.

### Documentación interactiva

Cuando `SWAGGER_ENABLED=true`, la documentación OpenAPI está disponible en:

```text
http://localhost:3000/api/docs
```

Swagger se utiliza como apoyo para consultar contratos, parámetros y respuestas de la API durante el desarrollo.

### Códigos comunes

| Código | Significado |
|---:|---|
| 200 | Operación exitosa |
| 201 | Registro creado |
| 400 | Datos inválidos |
| 404 | Recurso no encontrado |
| 409 | Conflicto por registro duplicado |
| 500 | Error interno |

---

# Groups

## Crear grupo

```http
POST /groups
```

### Body

```json
{
  "name": "Silvina C"
}
```

### Respuesta exitosa

```http
201 Created
```

---

## Consultar todos los grupos

```http
GET /groups
```

Incluye grupos activos e inactivos.

---

## Consultar grupos activos

```http
GET /groups/active
```

---

## Consultar grupo por ID

```http
GET /groups/:id
```

Ejemplo:

```http
GET /groups/1
```

---

## Modificar grupo

```http
PATCH /groups/:id
```

### Body

```json
{
  "name": "Nuevo nombre"
}
```

---

## Desactivar grupo

```http
DELETE /groups/:id
```

Realiza un borrado lógico.

---

## Reactivar grupo

```http
PATCH /groups/:id/restore
```

---

# Banks

## Crear banco

```http
POST /banks
```

### Body

```json
{
  "name": "Copter",
  "commissionPercentage": 0.8
}
```

### Respuesta exitosa

```http
201 Created
```

---

## Consultar todos los bancos

```http
GET /banks
```

Incluye bancos activos e inactivos.

---

## Consultar bancos activos

```http
GET /banks/active
```

---

## Consultar banco por ID

```http
GET /banks/:id
```

---

## Modificar banco

```http
PATCH /banks/:id
```

### Modificar nombre

```json
{
  "name": "Nuevo nombre"
}
```

### Modificar porcentaje

```json
{
  "commissionPercentage": 0.75
}
```

---

## Desactivar banco

```http
DELETE /banks/:id
```

---

## Reactivar banco

```http
PATCH /banks/:id/restore
```

---

# Commission Calculations

## Registrar una liquidación

```http
POST /commission-calculations
```

### Body

```json
{
  "groupId": 1,
  "bankId": 1,
  "collectionAmount": 7478560.37,
  "totalCommissionPercentage": 2.5,
  "clientCommissionPercentage": 1,
  "calculationDateTime": "2026-07-15T18:30:00",
  "notes": "Liquidación correspondiente al cierre del día."
}
```

### Respuesta

```json
{
  "id": 1,
  "groupId": 1,
  "groupName": "Silvina C",
  "bankId": 1,
  "bankName": "Copter",
  "collectionAmount": 7478560.37,
  "totalCommissionPercentage": 2.5,
  "bankCommissionPercentage": 0.4,
  "clientCommissionPercentage": 1,
  "ownCommissionPercentage": 1.1,
  "totalCommissionAmount": 186964.01,
  "bankCommissionAmount": 29914.24,
  "clientCommissionAmount": 74785.6,
  "ownCommissionAmount": 82264.16,
  "calculationDateTime": "2026-07-15T21:30:00.000Z",
  "notes": "Liquidación correspondiente al cierre del día.",
  "createdAt": "2026-07-15T20:51:39.474Z"
}
```

---

## Consultar una liquidación

```http
GET /commission-calculations/:id
```

Ejemplo:

```http
GET /commission-calculations/1
```

---

## Consultar historial de liquidaciones

```http
GET /commission-calculations
```

Devuelve las liquidaciones ordenadas desde la más reciente.

Todos los filtros son opcionales y pueden combinarse libremente.

### Parámetros de consulta

| Parámetro | Tipo | Descripción |
|---|---|---|
| `groupId` | number | Filtra por grupo |
| `bankId` | number | Filtra por banco |
| `from` | `YYYY-MM-DD` | Fecha inicial del período |
| `to` | `YYYY-MM-DD` | Fecha final del período |
| `page` | number | Página solicitada; por defecto 1 |
| `limit` | number | Cantidad máxima de registros por página; por defecto 10 |
| `sortBy` | string | Campo de ordenamiento habilitado; por defecto `calculationDateTime` |
| `sortOrder` | `ASC` o `DESC` | Dirección; por defecto `DESC` |

### Ejemplos

Todas las liquidaciones:

```http
GET /commission-calculations
```

Liquidaciones de un grupo:

```http
GET /commission-calculations?groupId=1
```

Liquidaciones de un banco:

```http
GET /commission-calculations?bankId=1
```

Liquidaciones de un período:

```http
GET /commission-calculations?from=2026-07-01&to=2026-07-31
```

Combinación de filtros:

```http
GET /commission-calculations?groupId=1&bankId=1&from=2026-07-01&to=2026-07-31
```

Paginación y ordenamiento:

```http
GET /commission-calculations?page=2&limit=20&sortBy=collectionAmount&sortOrder=ASC
```

### Estructura de respuesta paginada

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

`data` contiene objetos con la misma estructura pública utilizada por la consulta individual de liquidaciones.

### Respuestas

- **200 OK** cuando la consulta se realiza correctamente.
- **400 Bad Request** cuando la fecha inicial es posterior a la fecha final o los parámetros son inválidos.

---

## Dashboard de liquidaciones

### Obtener estadísticas del dashboard

```http
GET /commission-calculations/dashboard
```

Devuelve un resumen general de las liquidaciones registradas.

Si no se envían fechas, se consideran todas las liquidaciones existentes.

### Parámetros de consulta

| Parámetro | Tipo | Obligatorio | Descripción |
|---|---|---:|---|
| `from` | `YYYY-MM-DD` | No | Fecha inicial del período |
| `to` | `YYYY-MM-DD` | No | Fecha final del período |

Los parámetros pueden utilizarse de manera independiente o combinada.

### Ejemplos

Sin filtros:

```http
GET /commission-calculations/dashboard
```

Con período:

```http
GET /commission-calculations/dashboard?from=2026-07-01&to=2026-07-31
```

### Respuesta exitosa

```http
200 OK
```

```json
{
  "from": "2026-07-01",
  "to": "2026-07-31",
  "calculationCount": 4,
  "totalCollectionAmount": 15865599.12,
  "totalCommissionAmount": 396639.98,
  "bankCommissionAmount": 63462.4,
  "clientCommissionAmount": 158656,
  "ownCommissionAmount": 174521.58,
  "averageCollectionAmount": 3966399.78,
  "topGroup": {
    "id": 1,
    "name": "Silvina C",
    "totalCollectionAmount": 9225599.12
  },
  "topBank": {
    "id": 1,
    "name": "Copter",
    "calculationCount": 3
  }
}
```

Los valores son ilustrativos y dependen de los registros existentes.

### Campos de respuesta

| Campo | Tipo | Descripción |
|---|---|---|
| `from` | string o null | Fecha inicial utilizada |
| `to` | string o null | Fecha final utilizada |
| `calculationCount` | number | Cantidad de liquidaciones |
| `totalCollectionAmount` | number | Recaudación total |
| `totalCommissionAmount` | number | Comisión total acumulada |
| `bankCommissionAmount` | number | Comisión bancaria acumulada |
| `clientCommissionAmount` | number | Comisión del cliente acumulada |
| `ownCommissionAmount` | number | Comisión propia acumulada |
| `averageCollectionAmount` | number | Recaudación promedio |
| `topGroup` | object o null | Grupo con mayor recaudación |
| `topBank` | object o null | Banco más utilizado |

### Estructura de `topGroup`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | Identificador del grupo |
| `name` | string | Nombre del grupo |
| `totalCollectionAmount` | number | Recaudación acumulada del grupo |

### Estructura de `topBank`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | Identificador del banco |
| `name` | string | Nombre del banco |
| `calculationCount` | number | Cantidad de liquidaciones del banco |

### Período sin resultados

```json
{
  "from": "2025-01-01",
  "to": "2025-01-31",
  "calculationCount": 0,
  "totalCollectionAmount": 0,
  "totalCommissionAmount": 0,
  "bankCommissionAmount": 0,
  "clientCommissionAmount": 0,
  "ownCommissionAmount": 0,
  "averageCollectionAmount": 0,
  "topGroup": null,
  "topBank": null
}
```

### Errores de validación

Las fechas deben respetar el formato `YYYY-MM-DD`.

Ejemplo inválido:

```http
GET /commission-calculations/dashboard?from=01-07-2026
```

Si la fecha inicial es posterior a la fecha final:

```http
GET /commission-calculations/dashboard?from=2026-08-01&to=2026-07-01
```

La API responde:

```json
{
  "statusCode": 400,
  "message": "La fecha inicial no puede ser posterior a la fecha final.",
  "error": "Bad Request"
}
```

---

# Configuración relevante para consumo web

La API valida la configuración antes de iniciar. Para desarrollo local, `.env.example` contempla:

```text
NODE_ENV=development
PORT=3000
DB_HOST=
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
FRONTEND_URL=http://localhost:4200
SWAGGER_ENABLED=true
```

`FRONTEND_URL` determina el origen permitido por CORS. `SWAGGER_ENABLED` controla si se publica `/api/docs`.
