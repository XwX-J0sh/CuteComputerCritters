/// <reference types="cypress" />
/// <reference path="./index.d.ts" />

Cypress.Commands.add('login', () => {
  cy.visit('/');
  cy.contains('a', 'Login').click();
  cy.url().should('include', '/login');

  cy.get('input[name="username"]').type('User1');
  cy.get('input[name="password"]').type('password1');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/profile');
  cy.contains('a', 'Home').click();

});

Cypress.Commands.add('enterGame', () => {
  cy.visit('/');
  cy.contains('a', 'Meet your pet').click();
  cy.url().should('include', '/game-landing');
  cy.contains('Chiikawa').click();
  cy.get('canvas').should('exist').and('be.visible');

  cy.window()
    .its('testHelpers')
    .should('have.property', 'currentSceneName', 'MainMenu');

  cy.window()
    .its('testHelpers')
    .should('have.property', 'startMessageText', 'Click or hit ENTER to Start');
    // Simulate pressing Enter to go to PetMenu
    cy.get('canvas').trigger('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
    });

    // Ensure PetMenu is loaded
    cy.window()
        .its('testHelpers')
        .should('have.property', 'currentSceneName', 'PetMenu');
});

Cypress.Commands.add('clickCreateButton', () => {
  cy.window()
    .its('testHelpersReady')
    .should('eq', true);

  cy.window()
    .its('testHelpers')
    .should('exist')
    .its('createButton')
    .should('exist')
    .then((createButton) => {
      expect(createButton.emit).to.be.a('function');
      createButton.emit('pointerdown');
    });

  // Wait for scene switch
  cy.window()
    .its('testHelpers.currentSceneName')
    .should('eq', 'CreateCritterForm');
});

Cypress.Commands.add('createCritter', (name: string = 'cypress') => {
    cy.window()
      .should('have.property', 'testHelpers')
      .its('letterButtons')
      .should('exist')
      .then((buttons: Record<string, any>) => {
        const chars = name.split('');
        chars.forEach((char: string) => {
          const button =
            buttons[char] ??
            buttons[char.toUpperCase()] ??
            buttons[char.toLowerCase()];
          expect(button, `button for character "${char}"`).to.exist;
          button.emit('pointerdown');
        });
        });

    cy.window()
      .should('have.property', 'testHelpers')
      .its('saveButton')
      .should('exist')
      .then((btn) => {
        btn.emit('pointerdown');
      });
    cy.window()
      .its('testHelpers.currentSceneName')
      .should('equal', 'PetMenu');
});
