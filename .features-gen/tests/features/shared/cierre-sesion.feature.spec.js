// Generated from: tests\features\shared\cierre-sesion.feature
import { test } from "playwright-bdd";

test.describe('Cierre de sesión', () => {

  test('Cierre de sesión exitoso', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un usuario registrado con email "carlos@test.com" y contraseña "Clave@123"', null, { page }); 
    await When('abro el modal de inicio de sesión', null, { page }); 
    await And('ingreso credenciales email "carlos@test.com" y contraseña "Clave@123"', null, { page }); 
    await And('envío el formulario de inicio de sesión', null, { page }); 
    await And('hago clic en "Salir"', null, { page }); 
    await And('confirmo el cierre de sesión', null, { page }); 
    await Then('veo el botón "Iniciar Sesión"', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\shared\\cierre-sesion.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que soy un usuario registrado con email \"carlos@test.com\" y contraseña \"Clave@123\"","stepMatchArguments":[{"group":{"start":40,"value":"\"carlos@test.com\"","children":[{"start":41,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":71,"value":"\"Clave@123\"","children":[{"start":72,"value":"Clave@123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"Cuando abro el modal de inicio de sesión","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"Y ingreso credenciales email \"carlos@test.com\" y contraseña \"Clave@123\"","stepMatchArguments":[{"group":{"start":27,"value":"\"carlos@test.com\"","children":[{"start":28,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":58,"value":"\"Clave@123\"","children":[{"start":59,"value":"Clave@123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"Y envío el formulario de inicio de sesión","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"Y hago clic en \"Salir\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Salir\"","children":[{"start":14,"value":"Salir","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"Y confirmo el cierre de sesión","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Entonces veo el botón \"Iniciar Sesión\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Iniciar Sesión\"","children":[{"start":14,"value":"Iniciar Sesión","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end