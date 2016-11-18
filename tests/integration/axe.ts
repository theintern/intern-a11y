import * as registerSuite from 'intern!object';
import * as Test from 'intern/lib/Test';
import * as assert from 'intern/chai!assert';
import * as axe from 'intern/dojo/node!../../../../../src/services/axe';
import { A11yResults } from 'intern/dojo/node!../../../../../src/common';

import { IRequire } from 'dojo/loader';
declare const require: IRequire;

registerSuite({
	name: 'integration/aXe',

	bad: (function () {
		function check(promise: Promise<A11yResults>) {
			return promise.then(
				function () {
					throw new Error('test should not have passed');
				},
				function (error) {
					assert.match(error.message, /\d+ a11y violation/);
					assert.property(error, 'a11yResults', 'expected results to be attached to error');
				}
			);
		}

		return {
			Command(this: Test) {
				return check(this.remote
					.get(require.toUrl('../data/bad_page.html'))
					.sleep(1000)
					.then(axe.createChecker())
				);
			},

			standalone(this: Test) {
				return check(axe.check({
					source: require.toUrl('../data/bad_page.html'),
					remote: this.remote,
					waitFor: 1000
				}));
			},

			'missing remote'() {
				return check(axe.check({
					source: require.toUrl('../data/good_page.html'),
					remote: null
				}));
			}
		};
	})(),

	good: (function () {
		return {
			Command(this: Test) {
				return this.remote
					.get(require.toUrl('../data/good_page.html'))
					.sleep(1000)
					.then(axe.createChecker());
			},

			standalone(this: Test) {
				return axe.check({
					source: require.toUrl('../data/good_page.html'),
					remote: this.remote,
					waitFor: 1000
				});
			},

			'partial page'(this: Test) {
				return axe.check({
					source: require.toUrl('../data/bad_page.html'),
					remote: this.remote,
					waitFor: 1000,
					context: '#heading'
				});
			}
		};
	})()
});
