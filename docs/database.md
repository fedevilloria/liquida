# Modelo de datos

## 1. Vista general


Group 1 ─────── N CommissionCalculation N ─────── 1 Bank


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


groups


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


banks


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


commission_calculations


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


CommissionCalculation.groupId → Group.id
CommissionCalculation.bankId  → Bank.id


Las relaciones utilizan `RESTRICT` ante eliminaciones físicas.

---

## 6. Fórmulas previstas


ownCommissionPercentage =
totalCommissionPercentage
- bankCommissionPercentage
- clientCommissionPercentage



totalCommissionAmount =
collectionAmount × totalCommissionPercentage / 100



bankCommissionAmount =
collectionAmount × bankCommissionPercentage / 100



clientCommissionAmount =
collectionAmount × clientCommissionPercentage / 100



ownCommissionAmount =
collectionAmount × ownCommissionPercentage / 100


Cuando no existe comisión del cliente, se utilizará cero para realizar las operaciones.

---

## 7. Estado de implementación

Actualmente la entidad `CommissionCalculation` permite:

- Registrar una liquidación individual.
- Conservar una copia histórica de los porcentajes utilizados.
- Calcular automáticamente los importes correspondientes.
- Asociar la liquidación a un único grupo y un único banco.
- Registrar observaciones opcionales.
- Registrar la fecha y hora de corte utilizada para la liquidación.