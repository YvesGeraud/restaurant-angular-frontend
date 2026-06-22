# 🖥️ Restaurante Web Client — Frontend

Este es el cliente web frontend para el sistema de gestión del restaurante. Está construido sobre **Angular 21** utilizando una arquitectura limpia y altamente modular, diseñada para ofrecer una experiencia de usuario rápida, reactiva y fluida.

---

## 📋 Tabla de Contenidos
- [🚀 Características Principales](#-características-principales)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [📋 Requisitos Previos](#-requisitos-previos)
- [⚙️ Instalación y Configuración](#️-instalación-y-configuración)
- [🏃 Ejecución de la Aplicación](#-ejecución-de-la-aplicación)
- [🧪 Pruebas (Unitarias y E2E)](#-pruebas-unitarias-y-e2e)
- [🏗️ Generación de Componentes (Scaffolding)](#️-generación-de-componentes-scaffolding)
- [🧹 Formateo y Calidad de Código](#-formateo-y-calidad-de-código)

---

## 🚀 Características Principales

1. **Arquitectura Limpia y Modular**:
   - Dividido en capas lógicas: `Core` para lógica global y servicios, `Layouts` para plantillas de página, `Shared` para componentes comunes reutilizables y `Features` para módulos funcionales independientes.
2. **Integración con Stripe Checkout**:
   - Uso de `@stripe/stripe-js` en el cliente para el procesamiento seguro de pagos en reservaciones, redirigiendo al flujo oficial de Stripe y recibiendo las redirecciones de éxito o cancelación.
3. **Comunicación en Tiempo Real (GraphQL Subscriptions)**:
   - Suscripciones persistentes sobre WebSockets mediante **graphql-ws** y **Apollo Client** para notificar y recibir comandas en Cocina y actualizar dinámicamente el Mapa de Mesas.
4. **Visualizaciones de Datos Dinámicas**:
   - Gráficas interactivas y responsivas usando `ng-apexcharts` para el panel de administración, reportando ventas, ocupaciones y platillos populares.
5. **Alineación de Diseño y Micro-animaciones**:
   - Interfaz limpia construida con **Bootstrap 5** y **Bootstrap Icons**.
   - Animaciones fluidas mediante **AnimeJS** y notificaciones estilizadas con **SweetAlert2**.
6. **Manejo de Errores de API**:
   - Captura y visualización fluida de respuestas del backend, incluyendo el mapeo de errores de validación de esquemas Zod (como horarios fuera de rango en reservaciones o campos inválidos).

---

## 🛠️ Stack Tecnológico

- **Framework**: [Angular (v21.1.0)](https://angular.dev/)
- **Estilos**: [Bootstrap (v5.3.8)](https://getbootstrap.com/) & SASS (SCSS)
- **Animaciones y Alertas**: [AnimeJS](https://animejs.com/) & [SweetAlert2](https://sweetalert2.github.io/)
- **Gráficas**: [ApexCharts](https://apexcharts.com/) con [ng-apexcharts](https://github.com/apexcharts/ng-apexcharts)
- **API Moderna & Tiempo Real**: [Apollo Angular (v14+)](https://apollo-angular.com/) con [graphql-ws](https://github.com/enisdenjo/graphql-ws) (WebSockets)
- **Generación de Código**: [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) (para tipado automático)
- **Pasarela de Pagos**: [Stripe.js](https://stripe.com/docs/js)
- **Pruebas Unitarias**: [Vitest](https://vitest.dev/)
- **Pruebas E2E**: [Cypress](https://www.cypress.io/)
- **Linter & Formateador**: ESLint & Prettier
- **Gestor de Paquetes**: [pnpm](https://pnpm.io/)

---

## 📁 Estructura del Proyecto

La estructura del código fuente dentro de `src/app/` sigue la arquitectura recomendada:

```text
Frontend/
├── cypress/                 # Pruebas End-to-End (Cypress)
├── src/
│   ├── assets/              # Imágenes, fuentes y archivos estáticos globales
│   ├── environments/        # Configuraciones de entorno (API URL, Stripe Key)
│   │   ├── environment.development.ts
│   │   └── environment.ts
│   ├── app/
│   │   ├── app.ts           # Componente raíz principal
│   │   ├── app.routes.ts    # Enrutador principal de Angular
│   │   ├── app.config.ts    # Configuración de proveedores y HTTP Interceptors
│   │   ├── core/            # Módulos globales de única instancia
│   │   │   ├── auth/        # LoginState, Guards e Interceptor de autenticación
│   │   │   ├── http/        # Manejador genérico de peticiones HTTP
│   │   │   └── services/    # Servicios globales (Sockets, etc.)
│   │   ├── layouts/         # Plantillas de envoltura estructurales (Layouts)
│   │   │   ├── admin-layout/ # Plantilla para el Dashboard de Administración
│   │   │   └── public-layout/# Plantilla para la landing y páginas públicas
│   │   ├── shared/          # Componentes, Directivas y Pipes reutilizables
│   │   └── features/        # Módulos específicos de funcionalidad y páginas
│   │       ├── auth/        # Vistas de Login / Recuperar Clave
│   │       ├── cocina/      # Pantalla del monitor de cocina en tiempo real
│   │       ├── dashboard/   # Panel administrativo de reportes
│   │       ├── mesas/       # Vista de mapa interactivo de mesas
│   │       ├── ordenes/     # Registro de comandas y órdenes de clientes
│   │       ├── platillos/   # CRUD de menú y platillos
│   │       ├── public/      # Landing page del restaurante y reservaciones públicas
│   │       ├── reportes/    # Generación de reportes PDF y Excel
│   │       └── reservaciones/ # Gestión interna de reservaciones
│   ├── styles.scss          # Estilos globales y personalización de Bootstrap
│   └── main.ts              # Punto de arranque inicial del frontend
```

---

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu máquina local:
1. **Node.js** (v18.0.0 o superior)
2. **pnpm** (Gestor de dependencias predeterminado en el proyecto)
3. **Angular CLI** instalado de forma global (opcional): `npm install -g @angular/cli`

---

## ⚙️ Instalación y Configuración

### 1. Instalar dependencias
Desde la carpeta raíz del frontend, ejecuta:

```bash
pnpm install
```

### 2. Configurar las Variables de Entorno
Configura los valores del backend y Stripe en los archivos ubicados en `src/environments/`:

- **Desarrollo (`src/environments/environment.development.ts`)**:
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api', // Endpoint de la API del Backend
    stripePublicKey: 'pk_test_TU_CLAVE_PUBLICA_STRIPE', // Obtener en dashboard.stripe.com
  };
  ```

- **Producción (`src/environments/environment.ts`)**:
  ```typescript
  export const environment = {
    production: true,
    apiUrl: 'https://tu-api-backend.com/api',
    stripePublicKey: 'pk_live_TU_CLAVE_PUBLICA_STRIPE',
  };
  ```

---

## 🏃 Ejecución de la Aplicación

### Generar Tipos de GraphQL (Codegen)
El proyecto utiliza **GraphQL Code Generator** para generar servicios Angular y tipos fuertemente tipados a partir del esquema de base de datos/GraphQL del backend. Ejecuta el codegen con:

```bash
pnpm run codegen
```
Este comando analizará tus archivos `.graphql` bajo `src/graphql/` y creará los archivos autogenerados de tipos y operaciones (como `src/graphql/ordenes.generated.ts`), sincronizándolos automáticamente con el backend.

### Servidor de Desarrollo
Inicia un servidor de desarrollo local:

```bash
pnpm start
```
Una vez iniciado, navega en tu navegador a `http://localhost:4200/`. La aplicación se recargará automáticamente si realizas cambios en el código.

### Compilar para Producción
Compila el proyecto optimizado para subir a producción:

```bash
pnpm run build
```
Los archivos de distribución generados se almacenarán en la carpeta `dist/frontend`.

---

## 🧪 Pruebas (Unitarias y E2E)

El proyecto cuenta con un ecosistema doble de pruebas automatizadas:

### 1. Pruebas Unitarias (Vitest)
Verifican el correcto funcionamiento de servicios, directivas y lógica de componentes aislada.

- **Ejecutar pruebas en segundo plano (Watch Mode)**:
  ```bash
  pnpm test
  ```
- **Ejecutar pruebas una sola vez**:
  ```bash
  pnpm run test:unit
  ```

### 2. Pruebas E2E (Cypress)
Prueban flujos completos simulando el comportamiento de un usuario real dentro de un navegador.

- **Abrir la interfaz visual interactiva de Cypress**:
  ```bash
  pnpm run cypress:open
  ```
- **Ejecutar las pruebas en modo terminal (Headless)**:
  ```bash
  pnpm run test:e2e
  ```

*Para más detalles sobre la metodología y mocks de testing, consulta el archivo [README_TESTING.md](file:///c:/Proyectos%20personales/restaurante-node/Frontend/README_TESTING.md).*

---

## 🏗️ Generación de Componentes (Scaffolding)

Puedes utilizar el CLI de Angular para generar nuevas piezas de código consistentes y estructuradas:

```bash
# Generar un nuevo componente dentro de Shared
pnpm ng generate component shared/components/nombre-componente

# Generar un nuevo servicio dentro de Core
pnpm ng generate service core/services/nombre-servicio

# Generar un nuevo guard de rutas
pnpm ng generate guard core/guards/nombre-guard
```

---

## 🧹 Formateo y Calidad de Código

El proyecto tiene reglas estrictas de calidad y estilo de código configuradas con Prettier y ESLint.

### Ejecutar Linter (Errores de sintaxis y buenas prácticas)
```bash
pnpm run lint
```

### Ejecutar Prettier (Dar formato al código de forma automática)
```bash
pnpm run format
```
Esto formateará todos los archivos `.ts`, `.html`, `.scss` y `.json` según las reglas compartidas.
