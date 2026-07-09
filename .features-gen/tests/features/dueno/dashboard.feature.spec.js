// Generated from: tests\features\dueno\dashboard.feature
import { test } from "playwright-bdd";

test.describe('Dashboard del dueño', () => {

  test('Ver dashboard con resumen', async ({ Given, When, Then, page }) => { 
    await Given('que soy un dueño autenticado', null, { page }); 
    await When('estoy en el panel de dueño', null, { page }); 
    await Then('veo las tarjetas de resumen del dashboard', null, { page }); 
  });

  test('Ver agenda del día', async ({ Given, When, Then, page }) => { 
    await Given('que soy un dueño autenticado', null, { page }); 
    await When('estoy en el panel de dueño', null, { page }); 
    await Then('veo la tabla de reservas de hoy', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\dueno\\dashboard.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que soy un dueño autenticado","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"Cuando estoy en el panel de dueño","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Entonces veo las tarjetas de resumen del dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":12,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":13,"gherkinStepLine":14,"keywordType":"Context","textWithKeyword":"Dado que soy un dueño autenticado","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"Cuando estoy en el panel de dueño","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Entonces veo la tabla de reservas de hoy","stepMatchArguments":[]}]},
]; // bdd-data-end