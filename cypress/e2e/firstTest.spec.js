describe('Test with backend', () => {

  beforeEach('login to application', () => {
    cy.loginToApplication();
  })

  it('login to application', () => {
    cy.log('Yaaay we logged in');
  })
})
