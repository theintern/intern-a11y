import registerSuite, { Tests } from 'intern/lib/interfaces/object';
import { join } from 'path';

import { readFileSync } from 'fs';
import * as tenon from 'src/services/tenon';

const { assert } = intern.getPlugin('chai');

const keyPresent = process.env['TENON_API_KEY'] != null;

registerSuite('integration/tenon', {
	bad: (function() {
		function check(config: tenon.TenonTestOptions) {
			return tenon.check(config).then(
				function() {
					throw new Error('test should not have passed');
				},
				function(error) {
					assert.match(error.message, /\d+ a11y violation/);
					assert.property(
						error,
						'a11yResults',
						'expected results to be attached to error'
					);
				}
			);
		}

		return <Tests>{
			'external url'() {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return check({ source: 'http://google.com' });
			},

			'file name'() {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return check({ source: 'tests/data/bad_page.html' });
			},

			'file data'() {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return check({
					source: readFileSync(
						join(__dirname, '../data/bad_page.html'),
						{
							encoding: 'utf8'
						}
					)
				});
			},

			fragment() {
				if (!keyPresent) {
					this.skip('missing API key');
				}
				return check({
					source: 'tests/data/bad_fragment.html',
					config: { fragment: 1 }
				});
			}
		};
	})(),

	good: {
		'external url'() {
			if (!keyPresent) {
				this.skip('missing API key');
			}
			return tenon.check({
				source: 'http://tenon.io/documentation'
			});
		},

		'file name'() {
			if (!keyPresent) {
				this.skip('missing API key');
			}
			return tenon.check({
				source: 'tests/data/good_page.html'
			});
		},

		fragment() {
			if (!keyPresent) {
				this.skip('missing API key');
			}
			return tenon.check({
				source: 'tests/data/good_fragment.html',
				config: { fragment: 1 }
			});
		}
	}
});
