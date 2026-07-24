# API REST

## Información general

### URL local


http://localhost:3000


### Formato

Las solicitudes y respuestas utilizan JSON.

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


POST /groups


### Body


{
  "name": "Silvina C"
}


### Respuesta exitosa


201 Created


---

## Consultar todos los grupos


GET /groups


Incluye grupos activos e inactivos.

---

## Consultar grupos activos


GET /groups/active


---

## Consultar grupo por ID


GET /groups/:id


Ejemplo:


GET /groups/1


---

## Modificar grupo


PATCH /groups/:id


### Body


{
  "name": "Nuevo nombre"
}


---

## Desactivar grupo


DELETE /groups/:id


Realiza un borrado lógico.

---

## Reactivar grupo


PATCH /groups/:id/restore


---

# Banks

## Crear banco


POST /banks


### Body


{
  "name": "Copter",
  "commissionPercentage": 0.8
}


### Respuesta exitosa


201 Created


---

## Consultar todos los bancos


GET /banks


Incluye bancos activos e inactivos.

---

## Consultar bancos activos


GET /banks/active


---

## Consultar banco por ID


GET /banks/:id


---

## Modificar banco


PATCH /banks/:id


### Modificar nombre


{
  "name": "Nuevo nombre"
}


### Modificar porcentaje


{
  "commissionPercentage": 0.75
}


---

## Desactivar banco


DELETE /banks/:id


---

## Reactivar banco


PATCH /banks/:id/restore


---

# Commission Calculations

## Registrar una liquidación


POST /commission-calculations


### Body

json
{
  "groupId": 1,
  "bankId": 1,
  "collectionAmount": 7478560.37,
  "totalCommissionPercentage": 2.5,
  "clientCommissionPercentage": 1,
  "calculationDateTime": "2026-07-15T18:30:00",
  "notes": "Liquidación correspondiente al cierre del día."
}


### Respuesta

json
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
  "clientCommissionAmount": 74785.60,
  "ownCommissionAmount": 82264.16,
  "calculationDateTime": "2026-07-15T21:30:00.000Z",
  "notes": "Liquidación correspondiente al cierre del día.",
  "createdAt": "2026-07-15T20:51:39.474Z"
}

---

## Consultar historial de liquidaciones

GET /commission-calculations


Permite consultar el historial de liquidaciones mediante paginación, filtros opcionales y ordenamiento.

Por defecto, devuelve la primera página con un máximo de 10 liquidaciones, ordenadas desde la fecha de liquidación más reciente hacia la más antigua.

Todos los parámetros son opcionales y pueden combinarse entre sí.

### Parámetros de consulta

| Parámetro | Tipo | Valor predeterminado | Descripción |
|-----------|------|----------------------|-------------|
| groupId | number | - | Filtra las liquidaciones por grupo |
| bankId | number | - | Filtra las liquidaciones por banco |
| from | YYYY-MM-DD | - | Fecha inicial del período |
| to | YYYY-MM-DD | - | Fecha final del período |
| page | number | 1 | Número de página. Debe ser mayor o igual a 1 |
| limit | number | 10 | Cantidad máxima de liquidaciones por página |
| sortBy | string | calculationDateTime | Campo utilizado para ordenar los resultados |
| sortOrder | string | DESC | Dirección del ordenamiento: ASC o DESC |

### Ejemplos

#### Primera página


GET /commission-calculations?page=1&limit=10


#### Segunda página


GET /commission-calculations?page=2&limit=10


#### Liquidaciones de un grupo


GET /commission-calculations?groupId=1


#### Liquidaciones de un banco


GET /commission-calculations?bankId=1


#### Liquidaciones de un período


GET /commission-calculations?from=2026-07-01&to=2026-07-31


#### Ordenar por monto de recaudación de menor a mayor


GET /commission-calculations?sortBy=collectionAmount&sortOrder=ASC


#### Ordenar por monto de recaudación de mayor a menor


GET /commission-calculations?sortBy=collectionAmount&sortOrder=DESC


#### Combinar filtros, paginación y ordenamiento


GET /commission-calculations?groupId=1&bankId=1&from=2026-07-01&to=2026-07-31&page=1&limit=5&sortBy=collectionAmount&sortOrder=DESC


### Respuesta

json
{
  "data": [
    {
      "id": 1,
      "groupId": 1,
      "groupName": "Silvina C",
      "bankId": 1,
      "bankName": "Copter",
      "collectionAmount": 37584439.65,
      "totalCommissionPercentage": 2.5,
      "bankCommissionPercentage": 0.3,
      "clientCommissionPercentage": null,
      "ownCommissionPercentage": 2.2,
      "totalCommissionAmount": 939610.99,
      "bankCommissionAmount": 112753.32,
      "clientCommissionAmount": null,
      "ownCommissionAmount": 826857.67,
      "calculationDateTime": "2026-07-24T13:00:00.000Z",
      "notes": "Liquidación real de prueba - Silvina C.",
      "createdAt": "2026-07-24T14:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}


### Metadatos de paginación

| Campo | Descripción |
|-------|-------------|
| page | Página solicitada |
| limit | Cantidad máxima de registros por página |
| totalItems | Cantidad total de liquidaciones que cumplen los filtros |
| totalPages | Cantidad total de páginas disponibles |
| hasPreviousPage | Indica si existe una página anterior |
| hasNextPage | Indica si existe una página siguiente |

### Respuestas HTTP

- **200 OK** cuando la consulta se realiza correctamente.
- **400 Bad Request** cuando los parámetros son inválidos.
- **400 Bad Request** cuando la fecha inicial es posterior a la fecha final.
- **400 Bad Request** cuando se utiliza un campo o dirección de ordenamiento no permitidos.

---

## Consultar una liquidación


GET /commission-calculations/:id


Ejemplo:


GET /commission-calculations/1


### Respuestas HTTP

- **200 OK** cuando la liquidación existe.
- **404 Not Found** cuando no existe una liquidación con el identificador indicado.