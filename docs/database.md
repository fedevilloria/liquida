# Modelo de datos

## 1. Vista general

```text
Group 1 ─────── N CommissionCalculation N ─────── 1 Bank
```

Un grupo puede tener múltiples liquidaciones.

Un banco puede ser utilizado en múltiples liquidaciones.

Cada liquidación pertenece a un único grupo y utiliza un único banco.

---

## 2. BaseEntity

Clase base heredada por las entidades principales.

| Campo | Tipo | Descripción |
|---|---|---|
| id | integer | Identificador autogenerado |
| createdAt | timestamp | Fecha y hora de creación |
| updatedAt | timestamp | Fecha y hora de última modificación |

---

## 3. Group

Representa un grupo asociado a una recaudación.

### Tabla

`groups`

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | integer | PK | Identificador |
| createdAt | timestamp | No nulo | Fecha de creación |
| updatedAt | timestamp | No nulo | Última modificación |
| name | varchar(100) | Único, no nulo | Nombre del grupo |
| active | boolean | Default true | Estado lógico |

### Reglas

- El nombre debe ser único.
- Los grupos no se eliminan físicamente.
- Los grupos inactivos no estarán disponibles en nuevas liquidaciones.

---

## 4. Bank

Representa un banco o medio utilizado para recibir una recaudación.

### Tabla

`banks`

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | integer | PK | Identificador |
| createdAt | timestamp | No nulo | Fecha de creación |
| updatedAt | timestamp | No nulo | Última modificación |
| name | varchar(100) | Único, no nulo | Nombre del banco |
| commissionPercentage | numeric(5,2) | No nulo | Comisión bancaria |
| active | boolean | Default true | Estado lógico |

### Reglas

- El porcentaje no puede ser negativo.
- El porcentaje no puede superar el 100%.
- Los bancos no se eliminan físicamente.

---

## 5. CommissionCalculation

Representa una liquidación individual de comisión.

### Tabla

`commission_calculations`

| Campo | Tipo | Nulo | Descripción |
|---|---|---:|---|
| id | integer | No | Identificador |
| createdAt | timestamp | No | Fecha de creación |
| updatedAt | timestamp | No | Última modificación |
| collectionAmount | numeric(15,2) | No | Monto recaudado |
| totalCommissionPercentage | numeric(5,2) | No | Porcentaje total |
| bankCommissionPercentage | numeric(5,2) | No | Porcentaje bancario histórico |
| clientCommissionPercentage | numeric(5,2) | Sí | Porcentaje del cliente |
| ownCommissionPercentage | numeric(5,2) | No | Porcentaje propio |
| totalCommissionAmount | numeric(15,2) | No | Comisión total |
| bankCommissionAmount | numeric(15,2) | No | Importe del banco |
| clientCommissionAmount | numeric(15,2) | Sí | Importe del cliente |
| ownCommissionAmount | numeric(15,2) | No | Importe propio |
| notes | varchar(300) | Sí | Observaciones |
| calculationDateTime | timestamp | No | Fecha y hora de corte |
| groupId | integer | No | FK a groups |
| bankId | integer | No | FK a banks |

### Relaciones

```text
CommissionCalculation.groupId → Group.id
CommissionCalculation.bankId  → Bank.id
```

Las relaciones utilizan `RESTRICT` ante eliminaciones físicas.

---

## 6. Fórmulas

```text
ownCommissionPercentage =
totalCommissionPercentage
- bankCommissionPercentage
- clientCommissionPercentage
```

```text
totalCommissionAmount =
collectionAmount × totalCommissionPercentage / 100
```

```text
bankCommissionAmount =
collectionAmount × bankCommissionPercentage / 100
```

```text
clientCommissionAmount =
collectionAmount × clientCommissionPercentage / 100
```

```text
ownCommissionAmount =
collectionAmount × ownCommissionPercentage / 100
```

Cuando no existe comisión del cliente, se utiliza cero para realizar las operaciones.

---

## 7. Consultas derivadas del dashboard

El dashboard no incorpora nuevas tablas ni columnas.

Las métricas se calculan dinámicamente a partir de `commission_calculations` mediante consultas agregadas.

### Estadísticas generales

- Cantidad de liquidaciones: `COUNT(id)`.
- Recaudación total: `SUM(collectionAmount)`.
- Comisión total: `SUM(totalCommissionAmount)`.
- Comisión bancaria: `SUM(bankCommissionAmount)`.
- Comisión del cliente: `SUM(clientCommissionAmount)`.
- Comisión propia: `SUM(ownCommissionAmount)`.
- Recaudación promedio: `AVG(collectionAmount)`.

`COALESCE` se utiliza para devolver cero cuando no existen registros en el período consultado.

### Grupo con mayor recaudación

Las liquidaciones se agrupan por grupo y se suma `collectionAmount`.

El resultado se ordena de mayor a menor y se selecciona el primer registro.

### Banco más utilizado

Las liquidaciones se agrupan por banco y se cuenta la cantidad de registros.

El resultado se ordena de mayor a menor y se selecciona el primer registro.

### Filtros temporales

Las consultas pueden limitarse mediante:

- `from`: inicio completo del día indicado.
- `to`: final completo del día indicado.

---

## 8. Estado de implementación

Actualmente la entidad `CommissionCalculation` permite:

- Registrar una liquidación individual.
- Conservar una copia histórica de los porcentajes utilizados.
- Calcular automáticamente los importes correspondientes.
- Asociar la liquidación a un único grupo y un único banco.
- Registrar observaciones opcionales.
- Registrar la fecha y hora de corte utilizada para la liquidación.
- Consultar el historial mediante filtros.
- Obtener estadísticas y rankings sin modificar el modelo persistente.

---

## 9. Impacto del frontend sobre el modelo de datos

La incorporación del frontend no requirió nuevas tablas ni columnas.

Las pantallas de grupos, bancos y dashboard consumen el modelo existente exclusivamente a través de la API REST.

La edición del porcentaje de comisión de un banco modifica `Bank.commissionPercentage` para operaciones futuras. Las liquidaciones previamente registradas conservan su copia histórica en `CommissionCalculation.bankCommissionPercentage` y sus importes calculados.

La integración fue verificada modificando el porcentaje de un banco y comprobando que una nueva liquidación utiliza el valor actualizado.
