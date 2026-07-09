// Generated from: tests\features\shared\recuperacion.feature
import { test } from "playwright-bdd";

test.describe('Recuperación de contraseña', () => {

  test('Solicitar recuperación con correo válido', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un usuario registrado con email "carlos@test.com"', null, { page }); 
    await When('abro el modal de inicio de sesión', null, { page }); 
    await And('hago clic en "¿Olvidaste tu contraseña?"', null, { page }); 
    await And('ingreso mi email "carlos@test.com" en el campo de recuperación', null, { page }); 
    await And('envío la solicitud de recuperación', null, { page }); 
    await Then('veo un mensaje de éxito "Correo enviado"', null, { page }); 
  });

  test('Solicitar recuperación con correo no registrado', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un usuario registrado con email "carlos@test.com"', null, { page }); 
    await When('abro el modal de inicio de sesión', null, { page }); 
    await And('hago clic en "¿Olvidaste tu contraseña?"', null, { page }); 
    await And('ingreso mi email "noexiste@test.com" en el campo de recuperación', null, { page }); 
    await And('envío la solicitud de recuperación', null, { page }); 
    await Then('veo un mensaje de error "Correo no encontrado"', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\shared\\recuperacion.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que soy un usuario registrado con email \"carlos@test.com\"","stepMatchArguments":[{"group":{"start":40,"value":"\"carlos@test.com\"","children":[{"start":41,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"Cuando abro el modal de inicio de sesión","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"Y hago clic en \"¿Olvidaste tu contraseña?\"","stepMatchArguments":[{"group":{"start":13,"value":"\"¿Olvidaste tu contraseña?\"","children":[{"start":14,"value":"¿Olvidaste tu contraseña?","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"Y ingreso mi email \"carlos@test.com\" en el campo de recuperación","stepMatchArguments":[{"group":{"start":17,"value":"\"carlos@test.com\"","children":[{"start":18,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"Y envío la solicitud de recuperación","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Entonces veo un mensaje de éxito \"Correo enviado\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Correo enviado\"","children":[{"start":25,"value":"Correo enviado","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":15,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":16,"gherkinStepLine":17,"keywordType":"Context","textWithKeyword":"Dado que soy un usuario registrado con email \"carlos@test.com\"","stepMatchArguments":[{"group":{"start":40,"value":"\"carlos@test.com\"","children":[{"start":41,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"Cuando abro el modal de inicio de sesión","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"Y hago clic en \"¿Olvidaste tu contraseña?\"","stepMatchArguments":[{"group":{"start":13,"value":"\"¿Olvidaste tu contraseña?\"","children":[{"start":14,"value":"¿Olvidaste tu contraseña?","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"Y ingreso mi email \"noexiste@test.com\" en el campo de recuperación","stepMatchArguments":[{"group":{"start":17,"value":"\"noexiste@test.com\"","children":[{"start":18,"value":"noexiste@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"Y envío la solicitud de recuperación","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Entonces veo un mensaje de error \"Correo no encontrado\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Correo no encontrado\"","children":[{"start":25,"value":"Correo no encontrado","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end