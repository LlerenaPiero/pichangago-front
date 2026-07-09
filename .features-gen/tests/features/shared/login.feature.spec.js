// Generated from: tests\features\shared\login.feature
import { test } from "playwright-bdd";

test.describe('Inicio de sesión', () => {

  test('Inicio de sesión exitoso como jugador', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un usuario registrado con email "carlos@test.com" y contraseña "Clave@123"', null, { page }); 
    await When('abro el modal de inicio de sesión', null, { page }); 
    await And('ingreso credenciales email "carlos@test.com" y contraseña "Clave@123"', null, { page }); 
    await And('envío el formulario de inicio de sesión', null, { page }); 
    await Then('veo mi nombre en la barra de navegación', null, { page }); 
  });

  test('Inicio de sesión con credenciales inválidas', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un usuario registrado con email "carlos@test.com" y contraseña "Clave@123"', null, { page }); 
    await When('abro el modal de inicio de sesión', null, { page }); 
    await And('ingreso credenciales email "carlos@test.com" y contraseña "wrongpass"', null, { page }); 
    await And('envío el formulario de inicio de sesión', null, { page }); 
    await Then('veo un mensaje de error "Credenciales inválidas"', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\shared\\login.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que soy un usuario registrado con email \"carlos@test.com\" y contraseña \"Clave@123\"","stepMatchArguments":[{"group":{"start":40,"value":"\"carlos@test.com\"","children":[{"start":41,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":71,"value":"\"Clave@123\"","children":[{"start":72,"value":"Clave@123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"Cuando abro el modal de inicio de sesión","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"Y ingreso credenciales email \"carlos@test.com\" y contraseña \"Clave@123\"","stepMatchArguments":[{"group":{"start":27,"value":"\"carlos@test.com\"","children":[{"start":28,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":58,"value":"\"Clave@123\"","children":[{"start":59,"value":"Clave@123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"Y envío el formulario de inicio de sesión","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Entonces veo mi nombre en la barra de navegación","stepMatchArguments":[]}]},
  {"pwTestLine":14,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":15,"gherkinStepLine":16,"keywordType":"Context","textWithKeyword":"Dado que soy un usuario registrado con email \"carlos@test.com\" y contraseña \"Clave@123\"","stepMatchArguments":[{"group":{"start":40,"value":"\"carlos@test.com\"","children":[{"start":41,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":71,"value":"\"Clave@123\"","children":[{"start":72,"value":"Clave@123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"Cuando abro el modal de inicio de sesión","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"Y ingreso credenciales email \"carlos@test.com\" y contraseña \"wrongpass\"","stepMatchArguments":[{"group":{"start":27,"value":"\"carlos@test.com\"","children":[{"start":28,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":58,"value":"\"wrongpass\"","children":[{"start":59,"value":"wrongpass","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"Y envío el formulario de inicio de sesión","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Entonces veo un mensaje de error \"Credenciales inválidas\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Credenciales inválidas\"","children":[{"start":25,"value":"Credenciales inválidas","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end