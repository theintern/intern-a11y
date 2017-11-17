import { readFileSync } from 'fs';
import { join } from 'path';
import { TenonResults, toA11yResults } from 'src/services/_tenon';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

registerSuite('unit/tenon', {
	toA11yResults() {
		const data = readFileSync(
			join(__dirname, '../data/tenon_results.json'),
			{
				encoding: 'utf8'
			}
		);
		const results: TenonResults = JSON.parse(data);
		const a11yResults = toA11yResults(results);
		assert.lengthOf(
			a11yResults.violations,
			1,
			'unexpected number of violations'
		);
	}
});
