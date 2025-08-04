/// <reference types="cypress" />
declare namespace Cypress {
  interface Chainable {
    /**
     * Login and view profile, then return to homepage
     */
    login(): Chainable<void>;

    /**
     * Enter game from homepage via game-landing page
     */
    enterGame(): Chainable<void>;

    /**
     * Switches from game mainMenu to createCritterForm
     */
    clickCreateButton(): Chainable<void>;
    createCritter(name?: string): Chainable<void>;
  }
}
