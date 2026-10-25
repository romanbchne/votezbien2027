'use strict';
const { spawnSync } = require('child_process');
const suites = [
  'check-syntax.js',
  'tests.js',
  'test-simulation.js',
  'test-e2e-signconvention.js',
  'test-radar.js',
  'test-departage-ui.js',
  'test-integration.js',
  'test-flows.js',
  'test-order.js',
  'massive-simulation.js'
];
let failures = 0;
for (const file of suites) {
  console.log('\n' + '='.repeat(72) + '\nSuite : ' + file + '\n' + '='.repeat(72));
  const result = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (result.error) {
    console.error(result.error.message);
    failures++;
  } else if (result.status !== 0) {
    console.error('Échec de ' + file + ' (code ' + result.status + ')');
    failures++;
  }
}
console.log('\n' + (failures ? failures + ' suite(s) échouée(s).' : 'Toutes les suites sont réussies.'));
process.exitCode = failures ? 1 : 0;
