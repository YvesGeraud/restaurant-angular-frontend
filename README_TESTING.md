# Guía de Pruebas en el Frontend 🧪

Este documento explica los dos tipos de pruebas que tenemos en el sistema: **Pruebas E2E (Cypress)** y **Pruebas Unitarias (Vitest)**.

---

## 1. Pruebas E2E con Cypress (El Usuario Real) 🏎️

Cypress simula a un usuario real interactuando con la aplicación en un navegador.

### Cómo funciona el Login (`login.cy.ts`)
- **Aislamiento**: Limpia cookies antes de empezar.
- **Interceptación**: Usa `cy.intercept` para simular respuestas de la API.
- **Interacción**: Usa `cy.get()` para escribir en campos y hacer clic en botones.
- **Verificación**: Comprueba que la URL cambie a `/admin`.

### Comandos
- **Abrir interfaz visual:** `npm run cypress:open`
- **Ejecutar en terminal:** `npm run test:e2e`

---

## 2. Pruebas Unitarias con Vitest (Las Piezas Sueltas) 🧩

Las pruebas unitarias verifican que una pequeña parte del código (un servicio o un componente) funcione correctamente de forma aislada. Se encuentran en los archivos `.spec.ts`.

### Cómo funciona la prueba de servicio (`auth.service.spec.ts`)

Esta prueba no abre un navegador. Se enfoca exclusivamente en la lógica del código TypeScript.

#### Conceptos Clave:
1. **`TestBed`**: Es el "laboratorio" donde Angular crea el servicio para probarlo.
2. **`HttpClientTestingModule`**: Como no queremos hacer peticiones reales a internet, usamos este módulo para "simular" el protocolo HTTP.
3. **`httpMock.expectOne`**: Verificamos que el servicio esté intentando llamar a la URL correcta (ej. `/api/auth/login`).
4. **`req.flush()`**: Nosotros le damos manualmente la respuesta al servicio para ver cómo reacciona (si mapea bien los datos, si guarda el token, etc.).

#### Ejemplo de lo que probamos:
```typescript
it('debería llamar a login y retornar el usuario mapeado', () => {
  // 1. Llamamos al método del servicio
  service.login(credenciales).subscribe(user => {
    expect(user.usuario).toBe('test'); // 3. Verificamos el resultado
  });

  // 2. Simulamos la respuesta del servidor
  const req = httpMock.expectOne('.../auth/login');
  req.flush(mockResponse); 
});
```

### Comandos
- **Ejecutar pruebas unitarias:**
  ```bash
  npm run test:unit
  ```
  Esto ejecutará todas las pruebas `.spec.ts` y te dará un reporte en la terminal.

---

## ¿Cuándo usar cada una?

- **Usa Pruebas Unitarias (`.spec.ts`)**: Cuando crees una nueva función, un pipe, o un servicio que tenga lógica compleja de datos. Son muy rápidas de escribir y ejecutar.
- **Usa Cypress (`.cy.ts`)**: Cuando crees una nueva pantalla o un flujo completo (ej. "Crear un producto y ver que aparezca en la lista"). Aseguran que el usuario no se encuentre con la pantalla en blanco.

---
*Documentación actualizada para cubrir todo el ecosistema de pruebas.*
