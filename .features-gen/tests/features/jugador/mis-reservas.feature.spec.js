// Generated from: tests\features\jugador\mis-reservas.feature
import { test } from "playwright-bdd";

test.describe('Mis reservas', () => {

  test('Ver reservas activas', async ({ Given, When, Then, page }) => { 
    await Given('que soy un jugador autenticado', null, { page }); 
    await When('navego a la página de mis reservas', null, { page }); 
    await Then('veo la lista de reservas próximas', null, { page }); 
  });

  test('Cambiar a pestaña historial', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un jugador autenticado', null, { page }); 
    await When('navego a la página de mis reservas', null, { page }); 
    await And('cambio a la pestaña "Historial"', null, { page }); 
    await Then('veo el historial de reservas pasadas', null, { page }); 
  });

  test('Cancelar una reserva', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un jugador autenticado', null, { page }); 
    await When('navego a la página de mis reservas', null, { page }); 
    await And('abro el detalle de la primera reserva', null, { page }); 
    await And('hago clic en "Cancelar"', null, { page }); 
    await Then('veo el mensaje de cancelación exitosa', null, { page }); 
  });

  test('Ver detalle de reserva', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un jugador autenticado', null, { page }); 
    await When('navego a la página de mis reservas', null, { page }); 
    await And('abro el detalle de la primera reserva', null, { page }); 
    await Then('veo la información completa de la reserva', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\jugador\\mis-reservas.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que soy un jugador autenticado","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"Cuando navego a la página de mis reservas","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Entonces veo la lista de reservas próximas","stepMatchArguments":[]}]},
  {"pwTestLine":12,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":13,"gherkinStepLine":14,"keywordType":"Context","textWithKeyword":"Dado que soy un jugador autenticado","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"Cuando navego a la página de mis reservas","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"Y cambio a la pestaña \"Historial\"","stepMatchArguments":[{"group":{"start":20,"value":"\"Historial\"","children":[{"start":21,"value":"Historial","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Entonces veo el historial de reservas pasadas","stepMatchArguments":[]}]},
  {"pwTestLine":19,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":20,"gherkinStepLine":20,"keywordType":"Context","textWithKeyword":"Dado que soy un jugador autenticado","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"Cuando navego a la página de mis reservas","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"Y abro el detalle de la primera reserva","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"Y hago clic en \"Cancelar\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Cancelar\"","children":[{"start":14,"value":"Cancelar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Entonces veo el mensaje de cancelación exitosa","stepMatchArguments":[]}]},
  {"pwTestLine":27,"pickleLine":26,"tags":[],"steps":[{"pwStepLine":28,"gherkinStepLine":27,"keywordType":"Context","textWithKeyword":"Dado que soy un jugador autenticado","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"Cuando navego a la página de mis reservas","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":29,"keywordType":"Action","textWithKeyword":"Y abro el detalle de la primera reserva","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"Entonces veo la información completa de la reserva","stepMatchArguments":[]}]},
]; // bdd-data-end