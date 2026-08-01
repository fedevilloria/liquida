# Liquida API

API REST desarrollada con **NestJS** y **PostgreSQL** para la gestión de grupos, bancos y liquidaciones de comisiones.

El sistema permite administrar entidades maestras, registrar liquidaciones individuales, consultar el historial con filtros y paginación, y visualizar estadísticas generales mediante un dashboard.

---

# Tecnologías utilizadas

- NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- Swagger (OpenAPI 3)
- Jest
- Supertest
- Class Validator
- Class Transformer

---

# Funcionalidades

## Gestión de grupos

- Alta de grupos.
- Consulta de grupos.
- Consulta de grupos activos.
- Modificación.
- Desactivación lógica.
- Reactivación.

## Gestión de bancos

- Alta de bancos.
- Consulta de bancos.
- Consulta de bancos activos.
- Modificación.
- Desactivación lógica.
- Reactivación.

## Liquidaciones

- Registro de liquidaciones.
- Cálculo automático de comisiones.
- Historial con filtros.
- Paginación.
- Ordenamiento.
- Dashboard de estadísticas.

---

# Instalación

Instalar las dependencias:

```bash
npm install
```

---

# Variables de entorno

Crear un archivo:

```text
.env
```

tomando como referencia:

```text
.env.example
```

---

# Ejecutar la aplicación

Modo desarrollo:

```bash
npm run start:dev
```

Compilar:

```bash
npm run build
```

Producción:

```bash
npm run start:prod
```

---

# Documentación de la API

Una vez iniciada la aplicación, Swagger estará disponible en:

```
http://localhost:3000/api/docs
```

La disponibilidad de Swagger puede configurarse mediante la variable:

```env
SWAGGER_ENABLED=true
```

---

# Ejecutar pruebas

## Unitarias

```bash
npm test
```

Actualmente el proyecto posee:

- 6 suites
- 73 pruebas unitarias

---

## End-to-End

```bash
npm run test:e2e
```

Actualmente posee:

- 1 suite
- 6 pruebas HTTP

---

# Estructura del proyecto

```
src/
├── banks/
├── commission-calculations/
├── config/
├── groups/
└── main.ts

docs/
├── api.md
├── architecture.md
├── changelog.md
├── database.md
├── decisions.md
└── ers.md
```

---

# Documentación técnica

La carpeta **docs/** contiene la documentación funcional y técnica del proyecto:

| Documento | Descripción |
|-----------|-------------|
| api.md | Endpoints y ejemplos de uso |
| architecture.md | Arquitectura del sistema |
| database.md | Modelo y decisiones de base de datos |
| ers.md | Especificación de requisitos |
| decisions.md | Decisiones de diseño |
| changelog.md | Historial de cambios |

---

# Estado del proyecto

Actualmente el proyecto incluye:

- CRUD completo de grupos.
- CRUD completo de bancos.
- Registro de liquidaciones.
- Historial paginado.
- Dashboard.
- Validaciones mediante DTO.
- Documentación OpenAPI.
- Pruebas unitarias.
- Pruebas HTTP End-to-End.

---

# Licencia

Proyecto desarrollado con fines académicos y de aprendizaje.