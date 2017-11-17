import { readFileSync } from 'fs';
import { join } from 'path';
import { toA11yResults } from 'src/services/_axe';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

registerSuite('unit/aXe', {
	toA11yResults() {
		const data = readFileSync(join(__dirname, '../data/axe_results.json'), {
			encoding: 'utf8'
		});
		const results: any = JSON.parse(data);
		const a11yResults = toA11yResults(results);
		assert.lengthOf(
			a11yResults.violations,
			1,
			'unexpected number of violations'
		);
	}
});
