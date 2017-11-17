import registerSuite, { Tests } from 'intern/lib/interfaces/object';
import { createChecker, check } from 'src/services/axe';
import { A11yResults } from 'src/common';

const { assert } = intern.getPlugin('chai');

registerSuite('integration/aXe', {
	bad: (function() {
		function runCheck(
			promise: PromiseLike<A11yResults>,
			errorMatcher?: RegExp
		) {
			return promise.then(
				function() {
					throw new Error('test should not have passed');
				},
				function(error) {
					if (errorMatcher) {
						assert.match(error.message, errorMatcher);
					} else {
						assert.match(error.message, /\d+ a11y violation/);
						assert.property(
							error,
							'a11yResults',
							'expected results to be attached to error'
						);
					}
				}
			);
		}

		return <Tests>{
			Command() {
				return runCheck(
					this.remote
						.get('tests/data/bad_page.html')
						.sleep(1000)
						.then(createChecker())
				);
			},

			standalone() {
				return runCheck(
					check({
						source: 'tests/data/bad_page.html',
						remote: this.remote,
						waitFor: 1000
					})
				);
			},

			'missing remote'() {
				return runCheck(
					check({
						source: 'tests/data/good_page.html',
						remote: <any>undefined
					}),
					/A remote is required/
				);
			}
		};
	})(),

	good: {
		Command() {
			return this.remote
				.get('tests/data/good_page.html')
				.sleep(1000)
				.then(createChecker());
		},

		standalone() {
			return check({
				source: 'tests/data/good_page.html',
				remote: this.remote,
				waitFor: 1000
			});
		},

		'partial page'() {
			return check({
				source: 'tests/data/bad_page.html',
				remote: this.remote,
				waitFor: 1000,
				context: '#heading'
			});
		}
	}
});
