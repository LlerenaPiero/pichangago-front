// Generated from: tests\features\jugador\explorar.feature
import { test } from "playwright-bdd";

test.describe('Explorar canchas', () => {

  test('Buscar canchas en la página de inicio', async ({ Given, Then, page }) => { 
    await Given('que soy un visitante en la página de inicio', null, { page }); 
    await Then('veo el listado de canchas disponibles', null, { page }); 
  });

  test('Filtrar por distrito', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un visitante en la página de inicio', null, { page }); 
    await When('selecciono el distrito "Miraflores" en el buscador', null, { page }); 
    await And('hago clic en "🔍 Buscar"', null, { page }); 
    await Then('veo la página de resultados de búsqueda', null, { page }); 
  });

  test('Filtrar por nombre', async ({ Given, When, Then, And, page }) => { 
    await Given('que soy un visitante en la página de inicio', null, { page }); 
    await When('ingreso "Central" en el campo de búsqueda por nombre', null, { page }); 
    await And('hago clic en "🔍 Buscar"', null, { page }); 
    await Then('veo la página de resultados de búsqueda', null, { page }); 
  });

  test('Ver resultados de búsqueda en /buscar', async ({ Given, When, Then, page }) => { 
    await Given('que soy un visitante en la página de inicio', null, { page }); 
    await When('navego a la página de búsqueda', null, { page }); 
    await Then('veo canchas listadas en los resultados', null, { page }); 
  });

  test('Navegar al detalle desde los resultados', async ({ Given, When, Then, page }) => { 
    await Given('que soy un visitante en la página de inicio', null, { page }); 
    await When('hago clic en la primera cancha del listado', null, { page }); 
    await Then('veo los detalles de la cancha', null, { page }); 
  });

  test('Sin resultados de búsqueda', async ({ Given, When, Then, page }) => { 
    await Given('que soy un visitante en la página de inicio', null, { page }); 
    await When('navego a la página de búsqueda', null, { page }); 
    await Then('veo el contador de canchas encontradas', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('before', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\features\\jugador\\explorar.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Dado que soy un visitante en la página de inicio","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Entonces veo el listado de canchas disponibles","stepMatchArguments":[]}]},
  {"pwTestLine":11,"pickleLine":12,"tags":[],"steps":[{"pwStepLine":12,"gherkinStepLine":13,"keywordType":"Context","textWithKeyword":"Dado que soy un visitante en la página de inicio","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"Cuando selecciono el distrito \"Miraflores\" en el buscador","stepMatchArguments":[{"group":{"start":23,"value":"\"Miraflores\"","children":[{"start":24,"value":"Miraflores","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"Y hago clic en \"🔍 Buscar\"","stepMatchArguments":[{"group":{"start":13,"value":"\"🔍 Buscar\"","children":[{"start":14,"value":"🔍 Buscar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":15,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Entonces veo la página de resultados de búsqueda","stepMatchArguments":[]}]},
  {"pwTestLine":18,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":19,"gherkinStepLine":19,"keywordType":"Context","textWithKeyword":"Dado que soy un visitante en la página de inicio","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"Cuando ingreso \"Central\" en el campo de búsqueda por nombre","stepMatchArguments":[{"group":{"start":8,"value":"\"Central\"","children":[{"start":9,"value":"Central","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"Y hago clic en \"🔍 Buscar\"","stepMatchArguments":[{"group":{"start":13,"value":"\"🔍 Buscar\"","children":[{"start":14,"value":"🔍 Buscar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Entonces veo la página de resultados de búsqueda","stepMatchArguments":[]}]},
  {"pwTestLine":25,"pickleLine":24,"tags":[],"steps":[{"pwStepLine":26,"gherkinStepLine":25,"keywordType":"Context","textWithKeyword":"Dado que soy un visitante en la página de inicio","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"Cuando navego a la página de búsqueda","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"Entonces veo canchas listadas en los resultados","stepMatchArguments":[]}]},
  {"pwTestLine":31,"pickleLine":29,"tags":[],"steps":[{"pwStepLine":32,"gherkinStepLine":30,"keywordType":"Context","textWithKeyword":"Dado que soy un visitante en la página de inicio","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"Cuando hago clic en la primera cancha del listado","stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Entonces veo los detalles de la cancha","stepMatchArguments":[]}]},
  {"pwTestLine":37,"pickleLine":34,"tags":[],"steps":[{"pwStepLine":38,"gherkinStepLine":35,"keywordType":"Context","textWithKeyword":"Dado que soy un visitante en la página de inicio","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"Cuando navego a la página de búsqueda","stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"Entonces veo el contador de canchas encontradas","stepMatchArguments":[]}]},
]; // bdd-data-end