# Propuesta de Diseño y Arquitectura Futura para GRANTER

Para elevar el proyecto a un estándar de producción, se proponen las siguientes acciones correctivas, organizadas por prioridad en fases.

## Fase 1: Corrección de Vulnerabilidades Críticas

1.  **Refactorizar DTOs a `class`**:
    -   **Acción**: En `packages/shared/src/index.ts`, convertir todos los DTOs (`CreateGrantDto`, `CreateSourceDto`, etc.) de `type` a `class`.
    -   **Acción**: Añadir decoradores de `class-validator` (`@IsString`, `@IsUrl`, `@IsNotEmpty`, etc.) a todas las propiedades de los DTOs para definir reglas de validación estrictas.

2.  **Implementar Validación Global en el Backend**:
    -   **Acción**: En `apps/backend-core/src/main.ts`, registrar el `ValidationPipe` de forma global: `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));`. Esto activará la validación para todos los endpoints.

3.  **Asegurar Endpoints del Backend**:
    -   **Acción**: Eliminar el decorador `@Public()` de todos los endpoints que modifican datos en `grant.controller.ts` y otros controladores.
    -   **Acción**: Implementar un sistema de autenticación de máquina a máquina (M2M) para la comunicación entre el `data-service` y el `backend-core`.
        -   **Opción A (Tokens API)**: Crear un guardián especial en el backend que valide un token de API estático enviado en la cabecera `X-API-KEY`. Este secreto se compartiría entre ambos servicios a través de variables de entorno.
        -   **Opción B (JWT M2M)**: Crear un endpoint de autenticación para el `data-service` que le otorgue un JWT con permisos específicos.

4.  **Validar Token en el Frontend Middleware**:
    -   **Acción**: Modificar `middleware.ts` para que, si existe un token, realice una llamada a un nuevo endpoint en el backend (ej. `GET /auth/me`) que valide el token. Si la llamada falla, el token es inválido y se debe redirigir al login. Esto se puede optimizar con caching para no validar en cada petición.

## Fase 2: Endurecimiento de la Arquitectura

1.  **Crear Configuración de Producción para Docker**:
    -   **Acción**: Crear un archivo `docker-compose.prod.yml`.
    -   **Acción**: Añadir un servicio de **Reverse Proxy** (ej. Nginx, Traefik). Este será el único servicio con puertos expuestos (80, 443). Se encargará de dirigir el tráfico: `granter.app/*` al `web-frontend` y `api.granter.app/*` al `backend-core`. El `data-service` no debe ser accesible desde el exterior.
    -   **Acción**: En la configuración de producción, los servicios deben usar `target: production` en sus Dockerfiles para generar builds optimizadas y no montar volúmenes de código fuente.

2.  **Sincronizar Modelos de Datos**:
    -   **Acción**: Mantener los DTOs del paquete `@granter/shared` como la **única fuente de verdad**. El `data-service` debe importar estos tipos (o generar modelos Pydantic a partir de ellos) para evitar la desincronización y la manipulación manual de campos.

3.  **Mejorar el `BackendClient`**:
    -   **Acción**: Implementar el envío de la autenticación M2M (Fase 1).
    -   **Acción**: Reemplazar `except Exception` con un manejo de errores específico para códigos de estado HTTP y errores de red, utilizando un logger formal en lugar de `print()`.

## Fase 3: Optimización y Mantenibilidad

1.  **Completar el Pipeline de CI/CD**:
    -   **Acción**: En `.github/workflows/ci.yml`, añadir jobs paralelos para:
        -   `frontend-tests`: `npm test -w web-frontend`
        -   `data-service-tests`: `pytest apps/data-service/`
        -   `lint`: `npm run lint -- --format=check`
        -   `security-audit`: `npm audit --audit-level=high` y `pip-audit`.
    -   **Acción**: Hacer que un merge a `main` sea imposible si alguno de estos jobs falla.

2.  **Centralizar Lógica de Autenticación en Frontend**:
    -   **Acción**: Refactorizar `page.tsx` para eliminar las llamadas a `isAuthenticated()` y confiar únicamente en el componente `ProtectedRoute` para gestionar la protección de rutas.

3.  **Reforzar Tipado en `data-service`**:
    -   **Acción**: Para el endpoint `/discover`, usar `Enum` de Pydantic para el parámetro `scope` (`Literal["europa", "españa", "internacional"]`) en lugar de un `str` para una validación automática.
