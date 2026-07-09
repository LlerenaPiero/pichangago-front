// Generated from: tests\features\dueno\horarios.feature
import { test } from "playwright-bdd";

test.describe('Horarios y tarifas', () => {

  test('Ver horarios actuales', async ({ Given, When, Then, page }) => { 
    await Given('que soy un dueño autenticado', null, { page }); 
    await When('navego a la página de horarios', null, { page }); 
    await Then('veo los horarios configurados', null, { page }); 
  });

  test('Modificar horario', async ({ Given, When, Then, page }) => { 
    await Given('que soy un dueño autenticado', null, { page }); 
    await When('navego a la página de horarios', null, { page }); 
    await Then('veo las opciones para modificar horarios', null, { page }); 
  });

  test('Ver tarifas', async ({ Given, When, Then, page }) => { 
    await Given('que soy un dueño autenticado', null, { page }); 
    await When('navego a la página de tarifas', null, { page }); 
    await Then('veo las tarifas configuradas por día', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\dueno\\horarios.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que soy un dueño autenticado","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"Cuando navego a la página de horarios","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Entonces veo los horarios configurados","stepMatchArguments":[]}]},
  {"pwTestLine":12,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":13,"gherkinStepLine":14,"keywordType":"Context","textWithKeyword":"Dado que soy un dueño autenticado","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"Cuando navego a la página de horarios","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Entonces veo las opciones para modificar horarios","stepMatchArguments":[]}]},
  {"pwTestLine":18,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":19,"gherkinStepLine":19,"keywordType":"Context","textWithKeyword":"Dado que soy un dueño autenticado","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"Cuando navego a la página de tarifas","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Entonces veo las tarifas configuradas por día","stepMatchArguments":[]}]},
]; // bdd-data-end