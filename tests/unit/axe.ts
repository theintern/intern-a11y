import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as fs from 'intern/dojo/node!fs';
import { toA11yResults } from 'intern/dojo/node!../../../../../src/services/_axe';
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

registerSuite({
	name: 'unit/axe',

	toA11yResults() {
		const data = fs.readFileSync(require.toUrl('../data/axe_results.json'), { encoding: 'utf8' });
		const results: any = JSON.parse(data);
		const a11yResults = toA11yResults(results);
		assert.lengthOf(a11yResults.violations, 1, 'unexpected number of violations');
	}
});
