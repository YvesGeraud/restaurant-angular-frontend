describe('Navegación Básica', () => {
  it('debería cargar la aplicación correctamente', () => {
    cy.visit('/');
    // Check if the loading screen or the app root is present
    cy.get('body').should('be.visible');
  });

  it('debería redirigir al login si no está autenticado', () => {
    cy.visit('/admin');
    cy.url().should('include', '/login');
  });
});
