// Generated from: tests\features\jugador\detalle-cancha.feature
import { test } from "playwright-bdd";

test.describe('Detalle de cancha', () => {

  test('Ver detalle de cancha', async ({ Given, Then, page }) => { 
    await Given('que estoy en la página de detalle de la cancha "cancha-1"', null, { page }); 
    await Then('veo el nombre y distrito de la cancha', null, { page }); 
  });

  test('Ver slots disponibles', async ({ Given, Then, page }) => { 
    await Given('que estoy en la página de detalle de la cancha "cancha-1"', null, { page }); 
    await Then('veo los horarios disponibles para reservar', null, { page }); 
  });

  test('Seleccionar un slot', async ({ Given, When, Then, page }) => { 
    await Given('que estoy en la página de detalle de la cancha "cancha-1"', null, { page }); 
    await When('selecciono un horario disponible', null, { page }); 
    await Then('veo el resumen de la reserva con el total a pagar', null, { page }); 
  });

  test('Abrir modal de reserva', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un jugador autenticado en el detalle de la cancha "cancha-1"', null, { page }); 
    await When('selecciono un horario disponible', null, { page }); 
    await And('hago clic en "Reservar y Pagar (1 hrs) →"', null, { page }); 
    await Then('veo el modal de reserva con el paso de resumen', null, { page }); 
  });

  test('Reserva exitosa', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un jugador autenticado en el detalle de la cancha "cancha-1"', null, { page }); 
    await When('selecciono un horario disponible', null, { page }); 
    await And('hago clic en "Reservar y Pagar (1 hrs) →"', null, { page }); 
    await And('avanzo al paso de datos y completo nombre "Juan Pérez" y teléfono "999888777"', null, { page }); 
    await And('avanzo al paso de pago y confirmo la reserva', null, { page }); 
    await Then('veo la confirmación de reserva exitosa', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\jugador\\detalle-cancha.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que estoy en la página de detalle de la cancha \"cancha-1\"","stepMatchArguments":[{"group":{"start":47,"value":"\"cancha-1\"","children":[{"start":48,"value":"cancha-1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Entonces veo el nombre y distrito de la cancha","stepMatchArguments":[]}]},
  {"pwTestLine":11,"pickleLine":12,"tags":[],"steps":[{"pwStepLine":12,"gherkinStepLine":13,"keywordType":"Context","textWithKeyword":"Dado que estoy en la página de detalle de la cancha \"cancha-1\"","stepMatchArguments":[{"group":{"start":47,"value":"\"cancha-1\"","children":[{"start":48,"value":"cancha-1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Entonces veo los horarios disponibles para reservar","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":17,"gherkinStepLine":17,"keywordType":"Context","textWithKeyword":"Dado que estoy en la página de detalle de la cancha \"cancha-1\"","stepMatchArguments":[{"group":{"start":47,"value":"\"cancha-1\"","children":[{"start":48,"value":"cancha-1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"Cuando selecciono un horario disponible","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Entonces veo el resumen de la reserva con el total a pagar","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":23,"gherkinStepLine":22,"keywordType":"Context","textWithKeyword":"Dado que soy un jugador autenticado en el detalle de la cancha \"cancha-1\"","stepMatchArguments":[{"group":{"start":58,"value":"\"cancha-1\"","children":[{"start":59,"value":"cancha-1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"Cuando selecciono un horario disponible","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"Y hago clic en \"Reservar y Pagar (1 hrs) →\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Reservar y Pagar (1 hrs) →\"","children":[{"start":14,"value":"Reservar y Pagar (1 hrs) →","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Entonces veo el modal de reserva con el paso de resumen","stepMatchArguments":[]}]},
  {"pwTestLine":29,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":30,"gherkinStepLine":28,"keywordType":"Context","textWithKeyword":"Dado que soy un jugador autenticado en el detalle de la cancha \"cancha-1\"","stepMatchArguments":[{"group":{"start":58,"value":"\"cancha-1\"","children":[{"start":59,"value":"cancha-1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":31,"gherkinStepLine":29,"keywordType":"Action","textWithKeyword":"Cuando selecciono un horario disponible","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"Y hago clic en \"Reservar y Pagar (1 hrs) →\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Reservar y Pagar (1 hrs) →\"","children":[{"start":14,"value":"Reservar y Pagar (1 hrs) →","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":33,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"Y avanzo al paso de datos y completo nombre \"Juan Pérez\" y teléfono \"999888777\"","stepMatchArguments":[{"group":{"start":42,"value":"\"Juan Pérez\"","children":[{"start":43,"value":"Juan Pérez","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":66,"value":"\"999888777\"","children":[{"start":67,"value":"999888777","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":32,"keywordType":"Action","textWithKeyword":"Y avanzo al paso de pago y confirmo la reserva","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"Entonces veo la confirmación de reserva exitosa","stepMatchArguments":[]}]},
]; // bdd-data-end