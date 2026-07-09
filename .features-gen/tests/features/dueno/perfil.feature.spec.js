// Generated from: tests\features\dueno\perfil.feature
import { test } from "playwright-bdd";

test.describe('Perfil de dueño', () => {

  test('Ver perfil de dueño en el panel', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un dueño autenticado', null, { page }); 
    await When('estoy en el panel de dueño', null, { page }); 
    await And('hago clic en "👤 Mi Perfil"', null, { page }); 
    await Then('veo mi información personal', null, { page }); 
  });

  test('Ver datos financieros', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un dueño autenticado', null, { page }); 
    await When('estoy en el panel de dueño', null, { page }); 
    await And('hago clic en "👤 Mi Perfil"', null, { page }); 
    await Then('veo la sección de información de pagos', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\dueno\\perfil.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que soy un dueño autenticado","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"Cuando estoy en el panel de dueño","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"Y hago clic en \"👤 Mi Perfil\"","stepMatchArguments":[{"group":{"start":13,"value":"\"👤 Mi Perfil\"","children":[{"start":14,"value":"👤 Mi Perfil","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Entonces veo mi información personal","stepMatchArguments":[]}]},
  {"pwTestLine":13,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":14,"gherkinStepLine":15,"keywordType":"Context","textWithKeyword":"Dado que soy un dueño autenticado","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"Cuando estoy en el panel de dueño","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"Y hago clic en \"👤 Mi Perfil\"","stepMatchArguments":[{"group":{"start":13,"value":"\"👤 Mi Perfil\"","children":[{"start":14,"value":"👤 Mi Perfil","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Entonces veo la sección de información de pagos","stepMatchArguments":[]}]},
]; // bdd-data-end