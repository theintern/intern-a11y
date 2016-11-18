import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as Test from 'intern/lib/Test';
import * as fs from 'intern/dojo/node!fs';
import * as util from '../util';
import * as shell from 'intern/dojo/node!shelljs';
import { A11yResults, A11yError } from 'intern/dojo/node!../../../../../src/common';
import { IRequire } from 'dojo/loader';

import A11yReporter = require('intern/dojo/node!../../../../../src/A11yReporter');

declare const require: IRequire;

let reportFile: string;

registerSuite({
	name: 'unit/A11yReporter',

	afterEach() {
		if (reportFile) {
			shell.rm('-rf', reportFile);
			reportFile = null;
		}
	},

	'manual report'() {
		const data = fs.readFileSync(require.toUrl('../data/a11y_results.json'), { encoding: 'utf8' });
		const results = <A11yResults> JSON.parse(data);
		reportFile = '_tempreport.html';
		return A11yReporter.writeReport(reportFile, results, 'foo').then(function () {
			assert.isTrue(util.fileExists(reportFile));
		});
	},

	'failure report': {
		// Expect reports for all tests to be output to a single file
		'to file'() {
			reportFile = '_tempreport.html';
			const reporter = new A11yReporter({ filename: reportFile });

			const data = fs.readFileSync(require.toUrl('../data/a11y_results.json'), { encoding: 'utf8' });
			const results = <A11yResults> JSON.parse(data);

			const test1 = new Test({ name: 'test1' });
			const test2 = new Test({ name: 'test2' });
			test1.error = new A11yError('Oops', results);
			test2.error = new A11yError('Oops', results);

			reporter.testFail(test1);
			reporter.testFail(test2);
			assert.isFalse(util.fileExists(reportFile), 'did not expect report file to exist');

			reporter.runEnd();
			assert.isTrue(util.fileExists(reportFile), 'exected report file to exist');
		},

		// Expect report for each test to be output to an individual file, all in the same directory
		'to directory'() {
			reportFile = '_tempreports';
			const reporter = new A11yReporter({ filename: reportFile });

			const data = fs.readFileSync(require.toUrl('../data/a11y_results.json'), { encoding: 'utf8' });
			const results = <A11yResults> JSON.parse(data);

			const test1 = new Test({ name: 'test1' });
			const test2 = new Test({ name: 'test2' });
			test1.error = new A11yError('Oops', results);
			test2.error = new A11yError('Oops', results);

			reporter.testFail(test1);
			let entries = fs.readdirSync(reportFile);
			assert.lengthOf(entries, 1, 'unexpected number of report files');

			reporter.testFail(test2);
			entries = fs.readdirSync(reportFile);
			assert.lengthOf(entries, 2, 'unexpected number of report files');
		}
	}
});
