// Generated from: tests\features\shared\registro.feature
import { test } from "playwright-bdd";

test.describe('Registro de nuevo usuario', () => {

  test('Registro exitoso con datos válidos', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un visitante en la página de inicio', null, { page }); 
    await When('hago clic en "Iniciar Sesión"', null, { page }); 
    await And('hago clic en la pestaña "Registrarse"', null, { page }); 
    await And('completo el formulario de registro con nombre "Juan", apellido "Pérez", email "juan@test.com", contraseña "Clave@123", teléfono "999888777"', null, { page }); 
    await And('selecciono el rol de "Jugador"', null, { page }); 
    await And('envío el formulario de registro', null, { page }); 
    await Then('veo un mensaje de bienvenida con mi nombre', null, { page }); 
  });

  test('Registro con correo duplicado', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un visitante en la página de inicio', null, { page }); 
    await When('hago clic en "Iniciar Sesión"', null, { page }); 
    await And('hago clic en la pestaña "Registrarse"', null, { page }); 
    await And('completo el formulario de registro con nombre "Carlos", apellido "López", email "carlos@test.com", contraseña "Clave@123", teléfono "999888777"', null, { page }); 
    await And('selecciono el rol de "Jugador"', null, { page }); 
    await And('envío el formulario de registro', null, { page }); 
    await Then('veo un mensaje de error "ya está registrado"', null, { page }); 
  });

  test('Registro con campos obligatorios vacíos', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un visitante en la página de inicio', null, { page }); 
    await When('hago clic en "Iniciar Sesión"', null, { page }); 
    await And('hago clic en la pestaña "Registrarse"', null, { page }); 
    await And('envío el formulario de registro', null, { page }); 
    await Then('veo que los campos obligatorios muestran error', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\shared\\registro.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que soy un visitante en la página de inicio","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"Cuando hago clic en \"Iniciar Sesión\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Iniciar Sesión\"","children":[{"start":14,"value":"Iniciar Sesión","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"Y hago clic en la pestaña \"Registrarse\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Registrarse\"","children":[{"start":25,"value":"Registrarse","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"Y completo el formulario de registro con nombre \"Juan\", apellido \"Pérez\", email \"juan@test.com\", contraseña \"Clave@123\", teléfono \"999888777\"","stepMatchArguments":[{"group":{"start":46,"value":"\"Juan\"","children":[{"start":47,"value":"Juan","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":63,"value":"\"Pérez\"","children":[{"start":64,"value":"Pérez","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":78,"value":"\"juan@test.com\"","children":[{"start":79,"value":"juan@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":106,"value":"\"Clave@123\"","children":[{"start":107,"value":"Clave@123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":128,"value":"\"999888777\"","children":[{"start":129,"value":"999888777","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"Y selecciono el rol de \"Jugador\"","stepMatchArguments":[{"group":{"start":21,"value":"\"Jugador\"","children":[{"start":22,"value":"Jugador","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"Y envío el formulario de registro","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Entonces veo un mensaje de bienvenida con mi nombre","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":17,"tags":[],"steps":[{"pwStepLine":17,"gherkinStepLine":18,"keywordType":"Context","textWithKeyword":"Dado que soy un visitante en la página de inicio","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"Cuando hago clic en \"Iniciar Sesión\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Iniciar Sesión\"","children":[{"start":14,"value":"Iniciar Sesión","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"Y hago clic en la pestaña \"Registrarse\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Registrarse\"","children":[{"start":25,"value":"Registrarse","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"Y completo el formulario de registro con nombre \"Carlos\", apellido \"López\", email \"carlos@test.com\", contraseña \"Clave@123\", teléfono \"999888777\"","stepMatchArguments":[{"group":{"start":46,"value":"\"Carlos\"","children":[{"start":47,"value":"Carlos","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":65,"value":"\"López\"","children":[{"start":66,"value":"López","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":80,"value":"\"carlos@test.com\"","children":[{"start":81,"value":"carlos@test.com","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":110,"value":"\"Clave@123\"","children":[{"start":111,"value":"Clave@123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":132,"value":"\"999888777\"","children":[{"start":133,"value":"999888777","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"Y selecciono el rol de \"Jugador\"","stepMatchArguments":[{"group":{"start":21,"value":"\"Jugador\"","children":[{"start":22,"value":"Jugador","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"Y envío el formulario de registro","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Entonces veo un mensaje de error \"ya está registrado\"","stepMatchArguments":[{"group":{"start":24,"value":"\"ya está registrado\"","children":[{"start":25,"value":"ya está registrado","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":26,"pickleLine":26,"tags":[],"steps":[{"pwStepLine":27,"gherkinStepLine":27,"keywordType":"Context","textWithKeyword":"Dado que soy un visitante en la página de inicio","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"Cuando hago clic en \"Iniciar Sesión\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Iniciar Sesión\"","children":[{"start":14,"value":"Iniciar Sesión","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":29,"gherkinStepLine":29,"keywordType":"Action","textWithKeyword":"Y hago clic en la pestaña \"Registrarse\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Registrarse\"","children":[{"start":25,"value":"Registrarse","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":30,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"Y envío el formulario de registro","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"Entonces veo que los campos obligatorios muestran error","stepMatchArguments":[]}]},
]; // bdd-data-end