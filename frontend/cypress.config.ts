import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200', // or your dev server
    specPattern: 'cypress/e2e/**/*.cy.{ts,js,jsx,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
});
