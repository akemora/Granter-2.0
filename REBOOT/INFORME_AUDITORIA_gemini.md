# Informe Final: Auditoría de Seguridad y Arquitectura del Proyecto GRANTER

## 1. Resumen Ejecutivo

**Estado General del Proyecto: CRÍTICO**

El proyecto GRANTER presenta una base sólida en términos de estructura de código (Clean Architecture, Monorepo) y configuración para desarrollo local. Sin embargo, adolece de **vulnerabilidades de seguridad críticas y fallos arquitectónicos fundamentales** que impiden su paso a un entorno de producción.

La principal vulnerabilidad es una **ausencia total de autenticación y validación de entrada en el `backend-core`**, permitiendo que cualquier actor (interno o externo) pueda escribir datos sin restricciones. Esta auditoría detalla los problemas encontrados en cada componente y proporciona una hoja de ruta clara y accionable para solucionarlos.

### Principales Fortalezas

-   **Arquitectura Limpia**: Buena separación de responsabilidades en el `backend-core`.
-   **Monorepo Organizado**: Uso de Turborepo para gestionar los diferentes servicios y paquetes compartidos.
-   **Infraestructura de Desarrollo**: `docker-compose.yml` bien definido para un entorno de desarrollo local ágil.
-   **Buenas Prácticas de UI**: El `web-frontend` ofrece una experiencia de usuario reactiva y bien diseñada.

### Principales Debilidades Críticas

1.  **CWE-287 (Autenticación Rota)**: Los endpoints de creación (`POST /grants`, `POST /sources`) en el `backend-core` son públicos y no requieren autenticación.
2.  **CWE-20 (Validación de Entrada Inexistente)**: El `backend-core` no valida los datos entrantes debido a un error de diseño en los DTOs, permitiendo la corrupción de datos.
3.  **CWE-284 (Acceso Impropio)**: El `middleware` del frontend valida la existencia de un token, pero no su validez, dando una falsa sensación de seguridad.
4.  **Configuración Insegura para Producción**: El `docker-compose.yml` actual expondría todos los servicios internos a Internet.

---

## 2. Auditoría Detallada por Componente

### 2.1. Backend Core (`backend-core`) - NestJS

-   **(CRÍTICO) CWE-20: Ausencia de Validación de Entrada**: Los DTOs se definen como `type` en lugar de `class` en `packages/shared`, lo que impide el uso de `class-validator` de NestJS. Como resultado, los JSON maliciosos pueden ser insertados directamente en la base de datos.
-   **(CRÍTICO) CWE-306: Endpoints de Creación Públicos**: El decorador `@Public()` en `grant.controller.ts` expone endpoints que modifican datos a cualquier cliente sin autenticación.
-   **(BAJO) Falta de `ValidationPipe` Global**: No se ha configurado un `ValidationPipe` global en `app.module.ts`, lo cual es la práctica estándar en NestJS para asegurar que toda la entrada a la API sea validada.

### 2.2. Servicio de Datos (`data-service`) - Python/FastAPI

-   **(CRÍTICO) CWE-287: Cómplice en la Falla de Autenticación**: El `BackendClient` interno realiza peticiones a los endpoints de creación del backend sin ninguna cabecera de `Authorization`.
-   **(MEDIO) Manejo de Errores Frágil**: El `BackendClient` usa un `except Exception` genérico, ocultando la causa raíz de los errores (ej. fallo de red vs. error del servidor) e impidiendo la implementación de lógicas de reintento.
-   **(BAJO) Inconsistencia de Modelos de Datos**: La necesidad de renombrar campos manualmente (ej. `official_link` a `officialLink`) antes de enviar datos evidencia una falta de sincronización entre los modelos de Pydantic y los DTOs de NestJS.

### 2.3. Frontend (`web-frontend`) - Next.js

-   **(CRÍTICO) CWE-345: Validación de Token Insuficiente en Middleware**: `middleware.ts` solo comprueba la *existencia* de la cookie de autenticación, no su validez. Un token falso o inválido daría acceso a la interfaz de usuario.
-   **(BAJO) Código Redundante**: Múltiples comprobaciones de `isAuthenticated()` en `page.tsx`, cuya lógica debería estar centralizada en el componente `ProtectedRoute`.

### 2.4. Infraestructura (Docker & CI/CD)

-   **(ALTO) Configuración Insegura para Producción**: `docker-compose.yml` no es apto para producción. Expondría los puertos de la base de datos, el backend y el servicio de datos a Internet. No existe un archivo `docker-compose.prod.yml` que utilice un reverse proxy.
-   **(INCOMPLETO) CI/CD Pipeline**: El archivo `.github/workflows/ci.yml` está incompleto. No se puede verificar si se ejecutan tests para todos los servicios, análisis de seguridad (`npm audit`, `pip-audit`) o formateo de código.
