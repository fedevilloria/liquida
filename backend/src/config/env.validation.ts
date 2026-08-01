/**
 * Entornos permitidos para ejecutar la aplicación.
 */
const allowedNodeEnvironments = ['development', 'test', 'production'] as const;

type NodeEnvironment = (typeof allowedNodeEnvironments)[number];

/**
 * Comprueba que una variable obligatoria exista
 * y contenga un valor no vacío.
 */
const requireString = (
  config: Record<string, unknown>,
  key: string,
): string => {
  const value = config[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`La variable de entorno ${key} es obligatoria.`);
  }

  return value.trim();
};

/**
 * Convierte una variable de entorno a un número entero.
 *
 * También permite indicar un valor predeterminado.
 */
const parseInteger = (
  value: unknown,
  key: string,
  defaultValue?: number,
): number => {
  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`La variable de entorno ${key} es obligatoria.`);
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(
      `La variable de entorno ${key} debe ser un número entero mayor que cero.`,
    );
  }

  return parsedValue;
};

/**
 * Convierte valores textuales comunes a boolean.
 */
const parseBoolean = (
  value: unknown,
  key: string,
  defaultValue: boolean,
): boolean => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    throw new Error(`La variable de entorno ${key} debe ser true o false.`);
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  throw new Error(`La variable de entorno ${key} debe ser true o false.`);
};

/**
 * Valida y transforma las variables de entorno
 * antes de que la aplicación termine de iniciar.
 *
 * Si alguna variable obligatoria falta o tiene un valor
 * inválido, NestJS detendrá el arranque con un mensaje claro.
 */
export const validateEnvironment = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const nodeEnvValue =
    typeof config.NODE_ENV === 'string'
      ? config.NODE_ENV.trim()
      : 'development';

  if (!allowedNodeEnvironments.includes(nodeEnvValue as NodeEnvironment)) {
    throw new Error(
      'La variable NODE_ENV debe ser development, test o production.',
    );
  }

  const nodeEnv = nodeEnvValue as NodeEnvironment;

  return {
    ...config,

    NODE_ENV: nodeEnv,

    PORT: parseInteger(config.PORT, 'PORT', 3000),

    DB_HOST: requireString(config, 'DB_HOST'),

    DB_PORT: parseInteger(config.DB_PORT, 'DB_PORT', 5432),

    DB_USERNAME: requireString(config, 'DB_USERNAME'),

    DB_PASSWORD: requireString(config, 'DB_PASSWORD'),

    DB_NAME: requireString(config, 'DB_NAME'),

    FRONTEND_URL:
      typeof config.FRONTEND_URL === 'string' &&
      config.FRONTEND_URL.trim().length > 0
        ? config.FRONTEND_URL.trim()
        : 'http://localhost:4200',

    /**
     * Swagger queda habilitado por defecto en desarrollo
     * y deshabilitado por defecto en producción.
     *
     * Puede modificarse explícitamente mediante
     * SWAGGER_ENABLED=true o SWAGGER_ENABLED=false.
     */
    SWAGGER_ENABLED: parseBoolean(
      config.SWAGGER_ENABLED,
      'SWAGGER_ENABLED',
      nodeEnv !== 'production',
    ),
  };
};
