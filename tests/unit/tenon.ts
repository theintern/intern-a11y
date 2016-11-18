import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as fs from 'intern/dojo/node!fs';
import { TenonResults, toA11yResults } from 'intern/dojo/node!../../../../../src/services/_tenon';

import { IRequire } from 'dojo/loader';
declare const require: IRequire;

registerSuite({
	name: 'unit/tenon',

	toA11yResults() {
		const data = fs.readFileSync(require.toUrl('../data/tenon_results.json'), { encoding: 'utf8' });
		const results: TenonResults = JSON.parse(data);
		const a11yResults = toA11yResults(results);
		assert.lengthOf(a11yResults.violations, 1, 'unexpected number of violations');
	}
});
