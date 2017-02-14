import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Test = require('intern/lib/Test');
import * as tenon from 'intern/dojo/node!src/services/tenon';
import { readFileSync } from 'intern/dojo/node!fs';

import { IRequire } from 'dojo/loader';
declare const require: IRequire;

const keyPresent = process.env['TENON_API_KEY'] != null;

registerSuite({
	name: 'integration/tenon',

	bad: (function () {
		function check(config: tenon.TenonTestOptions) {
			return tenon.check(config).then(
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
			'external url'(this: Test) {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return check({ source: 'http://google.com' });
			},

			'file name'(this: Test) {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return check({ source: require.toUrl('../data/bad_page.html') });
			},

			'file data'(this: Test) {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return check({
					source: readFileSync(require.toUrl('../data/bad_page.html'), { encoding: 'utf8' })
				});
			},

			fragment(this: Test) {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return check({
					source: require.toUrl('../data/bad_fragment.html'),
					config: { fragment: 1 }
				});
			}
		};
	})(),

	good: (function () {
		return {
			'external url'(this: Test) {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return tenon.check({
					source: 'http://tenon.io/documentation'
				});
			},

			'file name'(this: Test) {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return tenon.check({
					source: require.toUrl('../data/good_page.html')
				});
			},

			fragment(this: Test) {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return tenon.check({
					source: require.toUrl('../data/good_fragment.html'),
					config: { fragment: 1 }
				});
			}
		};
	})()
});
