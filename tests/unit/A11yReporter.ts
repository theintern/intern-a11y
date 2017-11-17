import { readdirSync, readFileSync, rmdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import Test from 'intern/lib/Test';
import { fileExists } from '../util';
import { A11yResults, A11yError } from 'src/common';
import A11yReporter from 'src/A11yReporter';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

let reportFile: string | null;

function remove(path: string) {
	if (statSync(path).isDirectory()) {
		readdirSync(path)
			.map(file => join(path, file))
			.forEach(remove);
		rmdirSync(path);
	} else {
		unlinkSync(path);
	}
}

const dataDir = join(__dirname, '../data');

const mockExecutor: any = {
	on() {}
};

const mockConsole: any = {
	messages: [],
	log(message: string) {
		this.messages.push(message);
	},
	reset() {
		this.messages = [];
	}
};

registerSuite('unit/A11yReporter', {
	beforeEach() {
		mockConsole.reset();
	},

	afterEach() {
		if (reportFile) {
			remove(reportFile);
			reportFile = null;
		}
	},

	tests: {
		'manual report'() {
			const data = readFileSync(`${dataDir}/a11y_results.json`, {
				encoding: 'utf8'
			});
			const results = <A11yResults>JSON.parse(data);
			reportFile = '_tempreport.html';
			return A11yReporter.writeReport(reportFile, results, 'foo').then(
				function() {
					assert.isTrue(fileExists(reportFile!));
				}
			);
		},

		'failure report': {
			// Expect reports for all tests to be output to a single file
			'to file'() {
				reportFile = '_tempreport.html';
				const reporter = new A11yReporter(mockExecutor, {
					console: mockConsole,
					filename: reportFile
				});

				const data = readFileSync(`${dataDir}/a11y_results.json`, {
					encoding: 'utf8'
				});
				const results = <A11yResults>JSON.parse(data);

				const test1 = new Test({ name: 'test1', test: () => {} });
				const test2 = new Test({ name: 'test2', test: () => {} });
				test1.error = new A11yError('Oops', results);
				test2.error = new A11yError('Oops', results);

				reporter.testEnd(test1);
				reporter.testEnd(test2);
				assert.isFalse(
					fileExists(reportFile),
					'did not expect report file to exist'
				);

				reporter.suiteEnd(<any>{ hasParent: false });
				reporter.runEnd();
				assert.isTrue(
					fileExists(reportFile),
					'exected report file to exist'
				);

				assert.deepEqual(mockConsole.messages, [
					undefined,
					'A11y report written to _tempreport.html',
					'A11y report written to _tempreport.html',
					undefined
				]);
			},

			// Expect report for each test to be output to an individual file, all in the same directory
			'to directory'() {
				reportFile = '_tempreports';
				const reporter = new A11yReporter(mockExecutor, {
					console: mockConsole,
					filename: reportFile
				});

				const data = readFileSync(`${dataDir}/a11y_results.json`, {
					encoding: 'utf8'
				});
				const results = <A11yResults>JSON.parse(data);

				const test1 = new Test({ name: 'test1', test: () => {} });
				const test2 = new Test({ name: 'test2', test: () => {} });
				test1.error = new A11yError('Oops', results);
				test2.error = new A11yError('Oops', results);

				reporter.testEnd(test1);
				let entries = readdirSync(reportFile);
				assert.lengthOf(
					entries,
					1,
					'unexpected number of report files'
				);

				reporter.testEnd(test2);
				entries = readdirSync(reportFile);
				assert.lengthOf(
					entries,
					2,
					'unexpected number of report files'
				);

				assert.lengthOf(mockConsole.messages, 0);
			}
		}
	}
});
