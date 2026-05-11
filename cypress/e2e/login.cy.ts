describe('Flujo de Login', () => {
  // Ignorar excepciones no capturadas para que las pruebas de fallo no se detengan
  // si el código de la app lanza un error (como el 401).
  Cypress.on('uncaught:exception', () => false);

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('debería mostrar errores de validación para campos vacíos', () => {
    cy.get('#login_user').click().blur();
    cy.get('#login_pass').click().blur();
    
    cy.contains('El usuario es requerido').should('be.visible');
    cy.contains('La contraseña es requerida').should('be.visible');
  });

  it('debería iniciar sesión correctamente con credenciales válidas', () => {
    // Interceptar petición de login para simular respuesta (Estilo Supertest)
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        exito: true,
        datos: {
          usuario: {
            id_ct_usuario: 1,
            usuario: 'admindms',
            nombre_completo: 'Administrador',
            id_ct_rol: 1,
            rol: 'ADMINISTRADOR',
            permisos: ['DASHBOARD_VER', 'USUARIOS_VER']
          },
          token: 'mock-jwt-token'
        }
      }
    }).as('loginRequest');

    cy.get('#login_user').type('admindms');
    cy.get('#login_pass').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    
    // Debería redirigir al panel de administración
    cy.url().should('include', '/admin');
  });

  it('debería mostrar mensaje de error si el login falla', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {
        exito: false,
        mensaje: 'Credenciales inválidas'
      }
    }).as('loginFail');

    cy.get('#login_user').type('admin');
    cy.get('#login_pass').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    
    // Verificar que se muestra el mensaje de error de SweetAlert
    cy.get('.swal2-container').should('be.visible');
    cy.contains('Credenciales inválidas').should('be.visible');
  });

  // ESTA PRUEBA ES REAL (No usa cy.intercept)
  // Úsala solo si el backend está encendido y el usuario existe en la DB
  it('debería loguearse genuinamente contra el backend real', () => {
    cy.get('#login_user').type('admin');
    cy.get('#login_pass').type('password123');
    cy.get('button[type="submit"]').click();

    // Si las credenciales son correctas, debería entrar
    // Si son incorrectas, la prueba fallará (como es de esperar)
    cy.url().should('include', '/admin');
  });
});
